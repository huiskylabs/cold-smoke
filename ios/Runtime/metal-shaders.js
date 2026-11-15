// Lower the game's typed shader language to MSL. A stage-local aggregate lets
// the existing helper functions refer to U, M and named textures directly.
function metalShader(desc) {
  const types = { ...SSL_TYPES, vec2f: 'float2', vec3f: 'float3', vec4f: 'float4',
    vec2i: 'int2', vec3i: 'int3', vec4i: 'int4', vec2u: 'uint2', vec3u: 'uint3', vec4u: 'uint4',
    mat2x2f: 'float2x2', mat3x3f: 'float3x3', mat4x4f: 'float4x4' };
  const aliases = Object.fromEntries(Object.entries(SSL_TYPES).map(([k, v]) => [v, types[k]]));
  const lower = s => sslToGlsl(s.replace(/\bvar\s+(\w+)\s*:\s*(\w+)\s*;/g, 'var $1: $2 = {};'))
    .replace(/\b(?:[iu]?vec[234]|mat[234])\b/g, t => aliases[t])
    .replace(/\bdiscard\s*;/g, 'discard_fragment();')
    .replace(/\b(?:thread|device|kernel|constant|half|template|operator|this|new|as_type)\b/g, n => 'cs_' + n);
  const attrs = (desc.buffers || []).flatMap(b => b.attrs);
  const vary = Object.entries(desc.varyings || {});
  const uniforms = Object.entries(desc.uniforms || {});
  const fields = a => a.map(([n,t]) => types[t] + ' ' + n + ';').join('\n');
  const resources = [['constant Globals&', 'U', 'buffer(0)']];
  if (uniforms.length) resources.push(['constant MatU&', 'M', 'buffer(1)']);
  Object.entries(desc.textures || {}).forEach(([n,k], i) => {
    resources.push([k === 'shadow' || k === 'depth' ? 'depth2d<float>' : 'texture2d<float>', n, 'texture(' + i + ')']);
    if (k === '2d' || k === 'shadow') resources.push(['sampler', n + '_s', 'sampler(' + i + ')']);
  });
  const params = resources.map(([t,n,b]) => t + ' ' + n + ' [[' + b + ']]').join(', ');
  const args = resources.map(r => r[1]).join(', ');
  const constants = [];
  const body = lower([...(desc.lib || []), desc.vs, desc.fs || ''].join('\n'))
    .replace(/\bconst (\w+ \w+ = [^;]+);/g, (_, declaration) => {
      constants.push('constant ' + declaration + ';');
      return '';
    });
  const common = [
    '#include <metal_stdlib>', 'using namespace metal;',
    '#define tex(t,p) t.sample(t##_s,(p))',
    '#define texLod(t,p,l) t.sample(t##_s,(p),level(l))',
    '#define texFetch(t,p,l) t.read(uint2(p),uint(l))',
    '#define texFetchD(t,p,l) t.read(uint2(p),uint(l))',
    '#define texSize(t) float2(t.get_width(),t.get_height())',
    '#define texShadow(t,p,r) t.sample_compare(t##_s,(p),(r),level(0))',
    '#define dpdx dfdx', '#define dpdy dfdy', '#define inverseSqrt rsqrt',
    // The game also uses descending smoothsteps with dynamic endpoints.
    '#define smoothstep(a,b,x) csSmooth((a),(b),(x))',
    'template<class A,class B,class T> inline T csSmooth(A a,B b,T x) { T t=saturate((x-a)/(b-a)); return t*t*(3.0f-2.0f*t); }',
    'struct Globals {' + fields(GLOBALS) + '};',
    'struct MatU {' + fields(uniforms) + '};',
    'struct VIn {' + fields(attrs) + ' uint vid; uint iid; };',
    'struct VOut { float4 clip [[position]]; ' + fields(vary) + '};',
    'struct FOut { float4 color; };',
    attrs.length ? 'struct Attributes {' + attrs.map(([n,t],i) => types[t] + ' ' + n + ' [[attribute(' + i + ')]];').join('\n') + '};' : '',
    ...constants, 'struct Shader {', ...resources.map(([t,n]) => t + ' ' + n + ';'),
    body, '};',
    'vertex VOut vsMain(' + (attrs.length ? 'Attributes a [[stage_in]], ' : '') +
      'uint vid [[vertex_id]], uint iid [[instance_id]], ' + params + ') { Shader shader{' + args +
      '}; return shader.vert(VIn{' + [...attrs.map(([n]) => 'a.' + n), 'vid', 'iid'].join(', ') + '}); }',
  ];
  if (desc.fs) {
    const depthOnly = desc.colorFormat === null;
    common.push('fragment ' + (depthOnly ? 'void' : 'float4') + ' fsMain(VOut v [[stage_in]], ' + params + ') { Shader shader{' +
      args + '}; ' + (depthOnly ? 'shader.frag(v);' : 'return shader.frag(v).color;') + ' }');
  }
  return common.join('\n');
}
