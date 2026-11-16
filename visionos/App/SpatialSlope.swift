import ARKit
import CompositorServices
import SwiftUI
import simd
import os

let slopeLog = Logger(subsystem: "com.coldsmoke.vision", category: "Slope")

func reportSlopeMilestone(_ message: String) {
    slopeLog.notice("\(message, privacy: .public)")
    #if DEBUG
    if ProcessInfo.processInfo.arguments.contains("-SlopeDiagnostics") {
        FileHandle.standardError.write(Data((message + "\n").utf8))
    }
    #endif
}

struct SlopeConfiguration: CompositorLayerConfiguration {
    func makeConfiguration(capabilities: LayerRenderer.Capabilities, configuration: inout LayerRenderer.Configuration) {
        let foveated = capabilities.supportsFoveation ? capabilities.supportedLayouts(options: [.foveationEnabled]) : []
        configuration.isFoveationEnabled = foveated.contains(.dedicated) || foveated.contains(.layered)
        let layouts = configuration.isFoveationEnabled ? foveated : capabilities.supportedLayouts(options: [])
        configuration.layout = layouts.contains(.dedicated) ? .dedicated : .layered
        configuration.colorFormat = .bgra8Unorm_srgb
        configuration.depthFormat = .depth32Float
    }
}

// Prepare the next simulation update while Metal draws the previous eye pair.
// The compositor always receives two finished eyes and their matching pose.
final class SpatialSlope: @unchecked Sendable {
    typealias Request = ([String: Any], @escaping (Bool) -> Void) -> Void
    private let layer: LayerRenderer
    private let session = ARKitSession()
    private let tracking = WorldTrackingProvider()
    private let queue: MTLCommandQueue
    private let copy: MTLRenderPipelineState
    private let writeDepth: MTLDepthStencilState
    private let request: Request
    private let didEnd: () -> Void
    private let lock = NSLock()
    private var serial = Int.random(in: 1...1_000_000_000)
    private var preparing: Int?
    private var anchors: [Int: DeviceAnchor] = [:]
    private var lastCompleted = 0
    private var latest: (eyes: [SpatialEye], anchor: DeviceAnchor?)?
    private var cancelled = false
    private var reportedFrame = false
    // Used on the compositor thread. Count a stereo pair only the first time
    // it is presented; redisplaying a tracked frame does not advance the run.
    private var lastPresentedID = 0
    private var cadenceStart = 0.0
    private var freshIntervals = 0
    private var sceneInterval = 0.0
    private func recordPresentation(_ id: Int, at time: Double) {
        guard id != lastPresentedID else { return }
        lastPresentedID = id
        let elapsed = time - cadenceStart
        if cadenceStart == 0 || elapsed > 2 {
            cadenceStart = time; freshIntervals = 0; sceneInterval = 0
        } else {
            freshIntervals += 1
            if elapsed >= 1 {
                sceneInterval = elapsed / Double(freshIntervals)
                cadenceStart = time; freshIntervals = 0
            }
        }
    }
    private var previousPresentation: (index: UInt64, time: Double)?

    init(_ layer: LayerRenderer, request: @escaping Request, didEnd: @escaping () -> Void) throws {
        self.layer = layer; self.request = request; self.didEnd = didEnd
        let device = layer.device
        guard let queue = device.makeCommandQueue() else { throw RenderError("No compositor command queue") }
        self.queue = queue
        let shader = """
        #include <metal_stdlib>
        using namespace metal;
        struct V { float4 p [[position]]; float2 uv; uint layer [[render_target_array_index]]; };
        vertex V fullscreen(uint i [[vertex_id]], constant uint &layer [[buffer(0)]]) {
            float2 uv = float2((i << 1) & 2, i & 2);
            return {float4(uv.x * 2 - 1, 1 - uv.y * 2, 0, 1), uv, layer};
        }
        struct Output { half4 color [[color(0)]]; float depth [[depth(any)]]; };
        fragment Output scene(V v [[stage_in]], texture2d<float> eye [[texture(0)]],
                              depth2d<float> z [[texture(1)]], constant float4 &crop [[buffer(0)]],
                              constant float4 &clip [[buffer(1)]]) {
            constexpr sampler s(coord::normalized, address::clamp_to_edge, filter::linear);
            // Tighten bilinear weights only on axes that are being enlarged.
            // The positive weights preserve the FXAA silhouette without ringing.
            float2 size = float2(eye.get_width(), eye.get_height());
            float2 texel = v.uv * size - 0.5;
            float2 f = fract(texel);
            float2 amount = saturate((1.0 - fwidth(texel)) * 1.6);
            float2 weight = mix(f, f * f * (3.0 - 2.0 * f), amount);
            float3 c = eye.sample(s, (floor(texel) + weight + 0.5) / size).rgb;
            // The shared final composite already encoded its display colors.
            constexpr sampler point(coord::normalized, address::clamp_to_edge, filter::nearest);
            float d = z.sample(point, mix(crop.xy, crop.zw, v.uv));
            float reverseZ = saturate((mix(clip.x, clip.y, d) - clip.z) * clip.w);
            return {half4(half3(select(pow((c + 0.055) / 1.055, float3(2.4)), c / 12.92, c <= 0.04045)), 1), reverseZ};
        }
        """
        let lib = try device.makeLibrary(source: shader, options: nil)
        let desc = MTLRenderPipelineDescriptor()
        desc.inputPrimitiveTopology = .triangle
        desc.vertexFunction = lib.makeFunction(name: "fullscreen"); desc.fragmentFunction = lib.makeFunction(name: "scene")
        desc.colorAttachments[0].pixelFormat = layer.configuration.colorFormat
        desc.depthAttachmentPixelFormat = layer.configuration.depthFormat
        let ds = MTLDepthStencilDescriptor(); ds.isDepthWriteEnabled = true; ds.depthCompareFunction = .always
        guard let write = device.makeDepthStencilState(descriptor: ds) else { throw RenderError("Cannot configure compositor depth") }
        writeDepth = write
        copy = try device.makeRenderPipelineState(descriptor: desc)
    }

    func start() async throws {
        guard WorldTrackingProvider.isSupported else { throw RenderError("Head tracking is unavailable.") }
        try await session.run([tracking])
        guard !lock.withLock({ cancelled }) else { session.stop(); return }
        Thread.detachNewThread { [self] in
            Thread.current.name = "Snow compositor"
            while !lock.withLock({ cancelled }) {
                switch layer.state {
                case .invalidated: finish(); return
                case .paused: layer.waitUntilRunning()
                case .running: autoreleasepool { draw() }
                @unknown default: finish(); return
                }
            }
            finish()
        }
    }
    private func finish() {
        session.stop()
        DispatchQueue.main.async { self.didEnd() }
    }
    func stop() { lock.withLock { cancelled = true; latest = nil; preparing = nil; anchors.removeAll() } }

    func completed(_ id: Int, eyes: [SpatialEye]) {
        lock.withLock {
            guard let anchor = anchors.removeValue(forKey: id), !eyes.isEmpty, !cancelled, id > lastCompleted else { return }
            latest = (eyes, anchor); lastCompleted = id
        }
    }

    private func pose(_ m: simd_float4x4) -> [String: [String: Float]] {
        let p = m.columns.3, q = simd_quatf(m).vector
        return ["position": ["x": p.x, "y": p.y, "z": p.z],
                "orientation": ["x": q.x, "y": q.y, "z": q.z, "w": q.w]]
    }

    private func ask(_ drawable: LayerRenderer.Drawable, _ time: Double, _ anchor: DeviceAnchor) {
        let id: Int? = lock.withLock {
            guard preparing == nil, anchors.count < 2, !cancelled else { return nil }
            serial += 1; preparing = serial; anchors[serial] = anchor; return serial
        }
        guard let id else { return }
        let head = anchor.originFromAnchorTransform
        let views: [[String: Any]] = drawable.views.enumerated().map { i, view in
            let vp = view.textureMap.viewport, p = drawable.computeProjection(viewIndex: i)
            return ["transform": pose(head * view.transform),
                    "viewport": ["width": vp.width, "height": vp.height],
                    "projectionMatrix": (0..<4).flatMap { c in (0..<4).map { r in p[c][r] } }]
        }
        let index = drawable.presentationFrameIndex
        var interval = 0.0
        if let previous = previousPresentation, index > previous.index {
            interval = (time - previous.time) / Double(index - previous.index)
        }
        previousPresentation = (index, time)
        let packet: [String: Any] = ["id": id, "time": time * 1000, "frameInterval": interval, "sceneInterval": sceneInterval,
                                     "transform": pose(head), "views": views]
        DispatchQueue.main.async { [weak self] in
            guard let self, !self.lock.withLock({ self.cancelled }) else { return }
            self.request(packet) { ok in
                self.lock.withLock {
                    if self.preparing == id { self.preparing = nil }
                    if !ok { self.anchors.removeValue(forKey: id) }
                }
            }
        }
    }
    private func draw() {
        guard let frame = layer.queryNextFrame(), let timing = frame.predictTiming() else { return }
        frame.startUpdate(); frame.endUpdate()
        LayerRenderer.Clock().wait(until: timing.optimalInputTime)
        // A nil drawable invalidates the frame (including endSubmission) when the user leaves.
        guard let drawable = frame.queryDrawable(), let cb = queue.makeCommandBuffer() else { return }
        frame.startSubmission(); defer { frame.endSubmission() }
        let d = LayerRenderer.Clock.Instant.epoch.duration(to: drawable.frameTiming.presentationTime).components
        let t = Double(d.seconds) + Double(d.attoseconds) * 1e-18
        let anchor = tracking.state == .running ? tracking.queryDeviceAnchor(atTimestamp: t) : nil
        // Tracking can briefly drop. Hold the last pose instead of steering
        // from the room origin or advancing an unseen run.
        if let anchor, anchor.isTracked { ask(drawable, t, anchor) }
        let (pair, pairID) = lock.withLock { (latest, lastCompleted) }
        drawable.deviceAnchor = pair?.anchor ?? anchor
        // A layered drawable has one rate map with a different layer for each eye.
        // Address the view's slice in the vertex stage so Metal uses its matching map.
        for (idx, texture) in drawable.colorTextures.enumerated() {
            let pass = MTLRenderPassDescriptor()
            pass.renderTargetArrayLength = texture.arrayLength
            if layer.configuration.isFoveationEnabled {
                pass.rasterizationRateMap = drawable.rasterizationRateMaps[idx]
            }
            let col = pass.colorAttachments[0]!, depth = pass.depthAttachment!
            col.texture = texture
            col.clearColor = MTLClearColorMake(0.014, 0.023, 0.04, 1); col.loadAction = .clear; col.storeAction = .store
            depth.texture = drawable.depthTextures[idx]
            depth.clearDepth = 0; depth.loadAction = .clear; depth.storeAction = .store
            guard let enc = cb.makeRenderCommandEncoder(descriptor: pass) else { continue }
            for (i, view) in drawable.views.enumerated() where view.textureMap.textureIndex == idx {
                guard let pair, i < pair.eyes.count else { continue }
                let map = view.textureMap
                var slice = UInt32(map.sliceIndex)
                enc.setVertexBytes(&slice, length: MemoryLayout<UInt32>.size, index: 0)
                enc.setViewport(map.viewport); enc.setRenderPipelineState(copy)
                let eye = pair.eyes[i], range = drawable.depthRange
                var crop = eye.crop
                var clip = SIMD4<Float>(1 / eye.clip.x, 1 / eye.clip.y, 1 / range.x, 1 / (1 / range.y - 1 / range.x))
                enc.setDepthStencilState(writeDepth)
                enc.setFragmentTexture(eye.color, index: 0); enc.setFragmentTexture(eye.depth, index: 1)
                enc.setFragmentBytes(&crop, length: MemoryLayout.size(ofValue: crop), index: 0)
                enc.setFragmentBytes(&clip, length: MemoryLayout.size(ofValue: clip), index: 1)
                enc.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3)
            }
            enc.endEncoding()
        }
        drawable.encodePresent(commandBuffer: cb); cb.commit()
        if pair != nil { recordPresentation(pairID, at: t) }
        if !reportedFrame, let pair {
            reportedFrame = true
            reportSlopeMilestone("Presented \(pair.eyes.count) game views; first eye \(pair.eyes[0].color.width)x\(pair.eyes[0].color.height), tracked: \(pair.anchor?.isTracked == true)")
        }
    }
}
