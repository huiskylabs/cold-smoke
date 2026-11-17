import Metal

// The game shades its opaque scene into a conventional HDR/depth pair for postprocessing.
// Keep full scene density through the centre and reduce sampling only toward the edges.
final class SlopeSceneRaster {
    let map: MTLRasterizationRateMap
    let parameters: MTLBuffer
    let color, depth: MTLTexture
    let width, height: Int

    init?(_ device: MTLDevice, _ width: Int, _ height: Int) {
        self.width = width; self.height = height
        guard device.supportsRasterizationRateMap(layerCount: 1) else { return nil }
        let rates: [Float] = [0.35, 0.55, 0.75, 1, 1, 1, 1, 0.75, 0.55, 0.35]
        let layer = MTLRasterizationRateLayerDescriptor(horizontal: rates, vertical: rates)
        let desc = MTLRasterizationRateMapDescriptor(screenSize: MTLSize(width: width, height: height, depth: 1), layer: layer)
        guard let map = device.makeRasterizationRateMap(descriptor: desc),
              let parameters = device.makeBuffer(length: map.parameterDataSizeAndAlign.size, options: .storageModeShared) else { return nil }
        self.map = map; self.parameters = parameters
        map.copyParameterData(buffer: parameters, offset: 0)
        let physical = map.physicalSize(layer: 0)
        func make(_ format: MTLPixelFormat) -> MTLTexture? {
            let desc = MTLTextureDescriptor.texture2DDescriptor(pixelFormat: format, width: physical.width, height: physical.height, mipmapped: false)
            desc.usage = [.renderTarget, .shaderRead]; desc.storageMode = .private
            return device.makeTexture(descriptor: desc)
        }
        guard let color = make(.rgba16Float), let depth = make(.depth32Float) else { return nil }
        self.color = color; self.depth = depth
    }

    static func pipeline(_ device: MTLDevice) throws -> MTLRenderPipelineState {
        let source = """
        #include <metal_stdlib>
        using namespace metal;
        vertex float4 fullscreen(uint id [[vertex_id]]) {
            return float4(float2((id << 1) & 2, id & 2) * 2 - 1, 0, 1);
        }
        struct Output { half4 color [[color(0)]]; float depth [[depth(any)]]; };
        fragment Output expand(float4 pos [[position]], constant rasterization_rate_map_data &params [[buffer(0)]],
                               texture2d<half> color [[texture(0)]], depth2d<float> depth [[texture(1)]]) {
            rasterization_rate_map_decoder map(params);
            float2 px = map.map_screen_to_physical_coordinates(pos.xy);
            constexpr sampler linearFilter(coord::pixel, address::clamp_to_edge, filter::linear);
            constexpr sampler point(coord::pixel, address::clamp_to_edge, filter::nearest);
            return {color.sample(linearFilter, px), depth.sample(point, px)};
        }
        """
        let lib = try device.makeLibrary(source: source, options: nil)
        let desc = MTLRenderPipelineDescriptor()
        desc.label = "Expand stereo scene"
        desc.vertexFunction = lib.makeFunction(name: "fullscreen"); desc.fragmentFunction = lib.makeFunction(name: "expand")
        desc.colorAttachments[0].pixelFormat = .rgba16Float; desc.depthAttachmentPixelFormat = .depth32Float
        return try device.makeRenderPipelineState(descriptor: desc)
    }

    func resolve(into target: MTLTexture, depth targetDepth: MTLTexture, using cmd: MTLCommandBuffer,
                 pipeline: MTLRenderPipelineState, depthState: MTLDepthStencilState) throws {
        let pass = MTLRenderPassDescriptor()
        let col = pass.colorAttachments[0]!
        col.texture = target; col.loadAction = .dontCare; col.storeAction = .store
        pass.depthAttachment.texture = targetDepth; pass.depthAttachment.loadAction = .dontCare; pass.depthAttachment.storeAction = .store
        guard let enc = cmd.makeRenderCommandEncoder(descriptor: pass) else { throw RenderError("Cannot expand stereo scene") }
        enc.setRenderPipelineState(pipeline); enc.setDepthStencilState(depthState)
        enc.setFragmentTexture(color, index: 0); enc.setFragmentTexture(depth, index: 1)
        enc.setFragmentBuffer(parameters, offset: 0, index: 0)
        enc.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3); enc.endEncoding()
    }
}
