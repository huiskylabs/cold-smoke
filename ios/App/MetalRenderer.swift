import Foundation
import Metal

struct RenderError: LocalizedError {
    let message: String
    init(_ message: String) { self.message = message }
    var errorDescription: String? { message }
}

private func format(_ name: String) throws -> MTLPixelFormat {
    switch name {
    case "rgba8": return .rgba8Unorm
    case "rgba16f": return .rgba16Float
    case "rgba32f": return .rgba32Float
    case "r32f": return .r32Float
    case "r8": return .r8Unorm
    case "depth": return .depth32Float
    case "canvas": return .bgra8Unorm
    default: throw RenderError("Unknown texture format \(name)")
    }
}

private struct Pipeline {
    let state: MTLRenderPipelineState
    let depth: MTLDepthStencilState
    let cull: MTLCullMode
    let primitive: MTLPrimitiveType
    let bias: Float
    let slope: Float
    let fragment: Bool

    init(_ spec: [String: Any], device: MTLDevice) throws {
        let name = spec["name"] as? String ?? "Shader"
        let desc = MTLRenderPipelineDescriptor()
        desc.label = name
        guard let source = spec["source"] as? String else { throw RenderError("Missing MSL for \(name)") }
        let library: MTLLibrary
        do { library = try device.makeLibrary(source: source, options: nil) }
        catch { throw RenderError("\(name)\n\(error.localizedDescription)") }
        desc.vertexFunction = library.makeFunction(name: "vsMain")
        fragment = spec["fragment"] as? Bool == true
        if fragment { desc.fragmentFunction = library.makeFunction(name: "fsMain") }

        let layout = MTLVertexDescriptor()
        var location = 0
        for (i, stream) in (spec["attributes"] as? [[String: Any]] ?? []).enumerated() {
            // Buffer slots 0 and 1 carry the global and material uniforms.
            let slot = i + 2
            var stride = 0
            for width in stream["sizes"] as? [Int] ?? [] {
                guard (1...4).contains(width) else { throw RenderError("Invalid vertex width") }
                let attr = layout.attributes[location]!
                attr.bufferIndex = slot
                attr.format = [MTLVertexFormat.float, .float2, .float3, .float4][width - 1]
                attr.offset = stride
                stride += width * 4
                location += 1
            }
            layout.layouts[slot].stride = stride
            layout.layouts[slot].stepFunction = stream["instanced"] as? Bool == true ? .perInstance : .perVertex
        }
        if location != 0 { desc.vertexDescriptor = layout }
        if !(spec["colorFormat"] is NSNull) {
            let color = desc.colorAttachments[0]!
            color.pixelFormat = try format(spec["colorFormat"] as? String ?? "rgba16f")
            if spec["colorMask"] as? Bool == false { color.writeMask = [] }
            let blend = spec["blend"] as? String ?? "none"
            if blend != "none" {
                color.isBlendingEnabled = true
                color.sourceRGBBlendFactor = .one
                color.destinationRGBBlendFactor = .one
                color.sourceAlphaBlendFactor = .zero
                color.destinationAlphaBlendFactor = .one
                switch blend {
                case "alpha":
                    color.sourceRGBBlendFactor = .sourceAlpha
                    color.destinationRGBBlendFactor = .oneMinusSourceAlpha
                    color.sourceAlphaBlendFactor = .one
                    color.destinationAlphaBlendFactor = .oneMinusSourceAlpha
                case "premul": color.destinationRGBBlendFactor = .oneMinusSourceAlpha
                case "mul":
                    color.sourceRGBBlendFactor = .destinationColor
                    color.destinationRGBBlendFactor = .zero
                case "add4": color.sourceAlphaBlendFactor = .one
                case "trans": color.destinationRGBBlendFactor = .sourceAlpha
                case "add": break
                default: throw RenderError("Unknown blend mode \(blend)")
                }
            }
        }
        let ds = MTLDepthStencilDescriptor()
        if spec["depth"] as? Bool != false && spec["depthTarget"] as? Bool != false {
            desc.depthAttachmentPixelFormat = .depth32Float
            let test = spec["depthTest"] as? Bool != false
            ds.isDepthWriteEnabled = test && spec["depthWrite"] as? Bool != false
            switch test ? spec["depthFunc"] as? String ?? "less" : "always" {
            case "lequal": ds.depthCompareFunction = .lessEqual
            case "always": ds.depthCompareFunction = .always
            case "equal": ds.depthCompareFunction = .equal
            default: ds.depthCompareFunction = .less
            }
        }
        guard let depthState = device.makeDepthStencilState(descriptor: ds) else { throw RenderError("Depth state unavailable") }
        depth = depthState
        cull = ["none": MTLCullMode.none, "front": .front][spec["cull"] as? String ?? ""] ?? .back
        primitive = ["strip": MTLPrimitiveType.triangleStrip, "lines": .line][spec["topology"] as? String ?? ""] ?? .triangle
        bias = (spec["depthBias"] as? NSNumber)?.floatValue ?? 0
        slope = bias == 0 ? 0 : (spec["depthBiasSlope"] as? NSNumber)?.floatValue ?? 2
        state = try device.makeRenderPipelineState(descriptor: desc)
    }
}

// All packets are consumed on one serial queue. Offscreen passes and uploads
// continue in order even if the window temporarily cannot supply a drawable.
final class MetalRenderer {
    typealias Surface = (texture: MTLTexture, drawable: MTLDrawable?)
    let device: MTLDevice
    private let queue: MTLCommandQueue
    private let output: (Int, Int) -> Surface?
    private var textures: [Int: MTLTexture] = [:]
    private var samplers: [Int: MTLSamplerState] = [:]
    private var buffers: [Int: MTLBuffer] = [:]
    private var pipelines: [Int: Pipeline] = [:]
    private var samplerCache: [String: MTLSamplerState] = [:]
    private var globals = Data()
    private var size = (0, 0)
    private var surface: Surface?
    private var composite: MTLTexture?
    private var finishedScene = false
    private let upscale: MTLRenderPipelineState
    private var commandBuffer: MTLCommandBuffer?
    private var encoder: MTLRenderCommandEncoder?
    private var activePass: MTLRenderPassDescriptor?
    private var skippingPass = false
    private var currentPipeline = -1

    init(device: MTLDevice, output: @escaping (Int, Int) -> Surface?) throws {
        // Do the expensive lens composite at scene resolution, just like the original.
        // Only the last bilinear sample runs over every physical display pixel.
        let source = """
        #include <metal_stdlib>
        using namespace metal;
        struct Pixel { float4 pos [[position]]; float2 uv; };
        vertex Pixel presentVertex(uint id [[vertex_id]]) {
            float2 uv = float2((id << 1) & 2, id & 2);
            return {float4(uv.x * 2 - 1, 1 - uv.y * 2, 0, 1), uv};
        }
        fragment half4 presentFragment(Pixel p [[stage_in]], texture2d<half> scene [[texture(0)]]) {
            constexpr sampler bilinear(coord::normalized, address::clamp_to_edge, filter::linear);
            return scene.sample(bilinear, p.uv);
        }
        """
        let lib = try device.makeLibrary(source: source, options: nil)
        let pd = MTLRenderPipelineDescriptor()
        pd.label = "Present scene"; pd.vertexFunction = lib.makeFunction(name: "presentVertex")
        pd.fragmentFunction = lib.makeFunction(name: "presentFragment")
        pd.colorAttachments[0].pixelFormat = .bgra8Unorm
        upscale = try device.makeRenderPipelineState(descriptor: pd)
        self.device = device
        guard let queue = device.makeCommandQueue() else { throw RenderError("Metal command queue unavailable") }
        self.queue = queue
        self.output = output
    }

    private func commands() throws -> MTLCommandBuffer {
        if let commandBuffer { return commandBuffer }
        guard let buffer = queue.makeCommandBuffer() else { throw RenderError("Metal command buffer unavailable") }
        commandBuffer = buffer
        return buffer
    }

    private func texture(_ id: Int) throws -> MTLTexture {
        guard let t = textures[id] else { throw RenderError("Unknown texture \(id)") }
        return t
    }

    private func buffer(_ id: Int) throws -> MTLBuffer {
        guard let b = buffers[id] else { throw RenderError("Unknown buffer \(id)") }
        return b
    }

    private func createTexture(_ id: Int, _ spec: [String: Any]) throws {
        guard let w = spec["w"] as? Int, let h = spec["h"] as? Int, w > 0, h > 0,
              let name = spec["format"] as? String else { throw RenderError("Invalid texture") }
        let mip = spec["mips"] as? Bool == true
        let desc = MTLTextureDescriptor.texture2DDescriptor(pixelFormat: try format(name), width: w, height: h, mipmapped: mip)
        desc.usage = [.renderTarget, .shaderRead]
        desc.storageMode = .private
        guard let t = device.makeTexture(descriptor: desc) else { throw RenderError("Unable to allocate \(w)×\(h) \(name)") }
        textures[id] = t
        let filter = spec["filter"] as? String ?? "linear"
        let wrap = spec["wrap"] as? String ?? "clamp"
        let wrapY = spec["wrapY"] as? String ?? wrap
        let compare = spec["compare"] as? Bool == true
        let key = [filter, wrap, wrapY, String(mip), String(compare)].joined(separator: "/")
        if let cached = samplerCache[key] { samplers[id] = cached; return }
        let s = MTLSamplerDescriptor()
        let modes: [String: MTLSamplerAddressMode] = ["repeat": .repeat, "mirror": .mirrorRepeat]
        s.sAddressMode = modes[wrap] ?? .clampToEdge
        s.tAddressMode = modes[wrapY] ?? .clampToEdge
        s.minFilter = filter == "linear" ? .linear : .nearest
        s.magFilter = s.minFilter
        s.mipFilter = mip ? (filter == "linear" ? .linear : .nearest) : .notMipmapped
        if compare { s.compareFunction = .lessEqual }
        guard let sampler = device.makeSamplerState(descriptor: s) else { throw RenderError("Invalid sampler") }
        samplers[id] = sampler
        samplerCache[key] = sampler
    }

    // Source rows in the packet are tightly packed. Metal blits require a
    // device-aligned pitch on some pixel formats and GPU families.
    private func pixels(_ args: [Any], _ src: UnsafeRawBufferPointer) throws {
        let t = try texture(args[1] as! Int)
        let x = args[2] as! Int, y = args[3] as! Int, w = args[4] as! Int, h = args[5] as! Int
        let bpp: Int
        switch t.pixelFormat {
        case .r8Unorm: bpp = 1
        case .rgba16Float: bpp = 8
        case .rgba32Float: bpp = 16
        default: bpp = 4
        }
        let row = w * bpp, pitch = (row + 255) & ~255
        guard w > 0, h > 0, x >= 0, y >= 0, x+w <= t.width, y+h <= t.height,
              src.count == h * row, let ptr = src.baseAddress,
              let staging = device.makeBuffer(length: pitch*h, options: .storageModeShared),
              let blit = try commands().makeBlitCommandEncoder() else { throw RenderError("Invalid pixel upload") }
        for i in 0..<h { memcpy(staging.contents()+i*pitch, ptr+i*row, row) }
        blit.copy(from: staging, sourceOffset: 0, sourceBytesPerRow: pitch, sourceBytesPerImage: pitch*h,
                  sourceSize: MTLSize(width: w, height: h, depth: 1), to: t, destinationSlice: 0,
                  destinationLevel: 0, destinationOrigin: MTLOrigin(x: x, y: y, z: 0))
        blit.endEncoding()
    }

    private func beginPass(_ a: [Any]) throws {
        let colorID = a[1] as! Int, depthID = a[2] as! Int
        let desc = MTLRenderPassDescriptor()
        if colorID != 0 {
            let color = desc.colorAttachments[0]!
            if colorID == -1 {
                if surface == nil { surface = output(size.0, size.1) }
                guard surface != nil else { skippingPass = true; return }
                if composite?.width != size.0 || composite?.height != size.1 {
                    let td = MTLTextureDescriptor.texture2DDescriptor(pixelFormat: .bgra8Unorm, width: size.0, height: size.1, mipmapped: false)
                    td.usage = [.renderTarget, .shaderRead]; td.storageMode = .private
                    composite = device.makeTexture(descriptor: td)
                }
                guard let composite else { throw RenderError("Cannot allocate final scene texture") }
                color.texture = composite
                finishedScene = true
            } else { color.texture = try texture(colorID) }
            color.level = a[3] as! Int
            let clear = a[4] as! [Double]
            color.loadAction = clear.isEmpty ? .load : .clear
            color.storeAction = .store
            if clear.count == 4 { color.clearColor = MTLClearColorMake(clear[0],clear[1],clear[2],clear[3]) }
        }
        if depthID != 0 {
            let depth = desc.depthAttachment!
            depth.texture = try texture(depthID)
            let clear = a[5] as! Double
            depth.clearDepth = max(0, clear)
            depth.loadAction = clear < 0 ? .load : .clear
            depth.storeAction = .store
        }
        activePass = desc
        try startEncoding(desc)
    }

    private func startEncoding(_ desc: MTLRenderPassDescriptor) throws {
        guard let enc = try commands().makeRenderCommandEncoder(descriptor: desc) else { throw RenderError("Metal render pass unavailable") }
        encoder = enc
        enc.setFrontFacing(.counterClockwise)
        globals.withUnsafeBytes { bytes in
            guard let ptr = bytes.baseAddress, !bytes.isEmpty else { return }
            enc.setVertexBytes(ptr, length: bytes.count, index: 0)
            enc.setFragmentBytes(ptr, length: bytes.count, index: 0)
        }
        currentPipeline = -1
    }

    private func draw(_ a: [Any], _ material: UnsafeRawBufferPointer) throws {
        if skippingPass { return }
        let id = a[1] as! Int
        guard let enc = encoder, let p = pipelines[id] else { throw RenderError("Missing render pass or pipeline \(id)") }
        if currentPipeline != id {
            enc.setRenderPipelineState(p.state)
            enc.setCullMode(p.cull)
            enc.setDepthStencilState(p.depth)
            enc.setDepthBias(p.bias, slopeScale: p.slope, clamp: 0)
            currentPipeline = id
        }
        if let ptr = material.baseAddress, !material.isEmpty {
            enc.setVertexBytes(ptr, length: material.count, index: 1)
            if p.fragment { enc.setFragmentBytes(ptr, length: material.count, index: 1) }
        }
        for (i, id) in (a[7] as! [Int]).enumerated() {
            enc.setVertexBuffer(try buffer(id), offset: 0, index: i+2)
        }
        for (i, id) in (a[8] as! [Int]).enumerated() {
            let t = try texture(id)
            enc.setVertexTexture(t, index: i)
            enc.setVertexSamplerState(samplers[id], index: i)
            if p.fragment {
                enc.setFragmentTexture(t, index: i)
                enc.setFragmentSamplerState(samplers[id], index: i)
            }
        }
        let count = a[2] as! Int, instances = a[3] as! Int, first = a[4] as! Int, base = a[5] as! Int, ib = a[6] as! Int
        if ib != 0 {
            enc.drawIndexedPrimitives(type: p.primitive, indexCount: count, indexType: .uint32, indexBuffer: try buffer(ib),
                                      indexBufferOffset: first*4, instanceCount: instances, baseVertex: 0, baseInstance: base)
        } else {
            enc.drawPrimitives(type: p.primitive, vertexStart: first, vertexCount: count, instanceCount: instances, baseInstance: base)
        }
    }

    // A few particle and skeleton streams are updated mid-pass. End the
    // encoder, issue the ordered GPU copy, then reload the same attachments.
    // This preserves both earlier draws and untouched bytes in partial writes.
    private func interruptPass(_ upload: () throws -> Void) throws {
        let desc = activePass
        if desc != nil { encoder?.endEncoding(); encoder = nil }
        try upload()
        if let desc {
            if desc.colorAttachments[0].texture != nil { desc.colorAttachments[0].loadAction = .load }
            if desc.depthAttachment.texture != nil { desc.depthAttachment.loadAction = .load }
            try startEncoding(desc)
        }
    }

    // On the render queue, immediately after the shutter frame and before the next frame.
    func capture(completion: @escaping ([String: Any]?, String?) -> Void) throws {
        guard finishedScene, let scene = composite else { throw RenderError("No completed scene to photograph") }
        let width = scene.width, height = scene.height, row = width * 4
        let pitch = (row + 255) / 256 * 256
        guard let staging = device.makeBuffer(length: pitch * height, options: .storageModeShared),
              let command = queue.makeCommandBuffer(), let blit = command.makeBlitCommandEncoder() else {
            throw RenderError("Cannot read the scene texture")
        }
        blit.copy(from: scene, sourceSlice: 0, sourceLevel: 0, sourceOrigin: MTLOrigin(),
                  sourceSize: MTLSize(width: width, height: height, depth: 1), to: staging,
                  destinationOffset: 0, destinationBytesPerRow: pitch, destinationBytesPerImage: pitch * height)
        blit.endEncoding()
        command.addCompletedHandler { done in
            if let error = done.error { completion(nil, error.localizedDescription); return }
            var pixels = Data(capacity: row * height)
            let src = staging.contents().assumingMemoryBound(to: UInt8.self)
            for y in 0..<height { pixels.append(src + y * pitch, count: row) }
            completion(["w": width, "h": height, "bgra": pixels.base64EncodedString()], nil)
        }
        command.commit()
    }

    func submit(_ ops: [[Any]], data: Data, completion: @escaping (String?, Double) -> Void) throws {
        try data.withUnsafeBytes { (slab: UnsafeRawBufferPointer) in
            for a in ops {
                func slice(_ i: Int) throws -> UnsafeRawBufferPointer {
                    let start = a[i] as! Int, n = a[i+1] as! Int
                    guard start >= 0, n >= 0, n <= slab.count, start <= slab.count-n else { throw RenderError("Invalid upload range") }
                    return UnsafeRawBufferPointer(rebasing: slab[start..<start+n])
                }
                let id = a.count > 1 ? (a[1] as? Int ?? 0) : 0
                switch a.first as? String {
                case "texture": try createTexture(id, a[2] as! [String: Any])
                case "pixels": try interruptPass { try pixels(a, slice(6)) }
                case "mips":
                    guard let blit = try commands().makeBlitCommandEncoder() else { throw RenderError("Metal blit unavailable") }
                    blit.generateMipmaps(for: try texture(id))
                    blit.endEncoding()
                case "dropTexture": textures[id] = nil; samplers[id] = nil
                case "buffer":
                    let bytes = try slice(2)
                    guard let b = device.makeBuffer(length: max(4, bytes.count), options: .storageModeShared) else { throw RenderError("Buffer allocation failed") }
                    if let ptr = bytes.baseAddress { memcpy(b.contents(), ptr, bytes.count) }
                    buffers[id] = b
                case "write":
                    let old = try buffer(id), offset = a[2] as! Int, bytes = try slice(3)
                    guard offset >= 0, offset <= old.length - bytes.count, let ptr = bytes.baseAddress else { throw RenderError("Invalid buffer update") }
                    try interruptPass {
                        guard let upload = device.makeBuffer(bytes: ptr, length: bytes.count, options: .storageModeShared),
                              let blit = try commands().makeBlitCommandEncoder() else { throw RenderError("Buffer upload failed") }
                        blit.copy(from: upload, sourceOffset: 0, to: old, destinationOffset: offset, size: bytes.count)
                        blit.endEncoding()
                    }
                case "dropBuffer": buffers[id] = nil
                case "pipeline": pipelines[id] = try Pipeline(a[2] as! [String: Any], device: device)
                case "globals": globals = Data(try slice(1))
                case "frame": size = (id, a[2] as! Int); finishedScene = false
                case "pass": try beginPass(a)
                case "draw": try draw(a, slice(9))
                case "endPass": encoder?.endEncoding(); encoder = nil; skippingPass = false; activePass = nil
                case "present":
                    if let surface, let drawable = surface.drawable {
                        let command = try commands()
                        if let composite {
                            let pass = MTLRenderPassDescriptor()
                            let color = pass.colorAttachments[0]!
                            color.texture = surface.texture; color.loadAction = .dontCare; color.storeAction = .store
                            guard let enc = command.makeRenderCommandEncoder(descriptor: pass) else { throw RenderError("Cannot present scene") }
                            enc.setRenderPipelineState(upscale); enc.setFragmentTexture(composite, index: 0)
                            enc.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3); enc.endEncoding()
                        }
                        command.present(drawable)
                    }
                    surface = nil
                default: throw RenderError("Unknown Metal command")
                }
            }
        }
        if let cb = commandBuffer {
            cb.addCompletedHandler { cb in completion(cb.error?.localizedDescription, max(0, cb.gpuEndTime - cb.gpuStartTime)) }
            cb.commit()
            commandBuffer = nil
        } else { completion(nil, 0) }
    }
}
