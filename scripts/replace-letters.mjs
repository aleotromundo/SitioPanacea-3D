// Reemplaza las letras 3D físicas "BRUNO SIMON" del GLB de áreas por un texto propio.
// Uso: node replace-letters.mjs <entrada.glb> <salida.glb> [texto] [--draco]
// Requiere (sin guardarlas en package.json): three, @gltf-transform/*, draco3dgltf
import fs from 'node:fs'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, KHRDracoMeshCompression } from '@gltf-transform/extensions'
import * as THREE from 'three'
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const [ , , input, output, textArg, flag ] = process.argv
const TEXT = textArg && !textArg.startsWith('--') ? textArg : 'OtroMundo'
const useDraco = process.argv.includes('--draco')
const FONT = new URL('../static/fonts/Pally-Bold.ttf', import.meta.url)
const FONT_PATH = process.env.FONT_PATH || FONT.pathname

const CAP_HEIGHT = 1.44  // altura de mayúscula (igual que las letras originales)
const DEPTH = 0.46       // grosor
const GAP = 0.14         // espacio entre letras
const GROUND_Y = -3.248  // base sobre la que apoyan las letras (nodo.y - altura/2 original)

// --- Fuente
const ttf = fs.readFileSync(FONT_PATH)
const font = new FontLoader().parse(new TTFLoader().parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength)))

// Escala para que la "M" tenga la altura de mayúscula deseada
const probe = new TextGeometry('M', { font, size: 1, depth: 0.1, curveSegments: 6, bevelEnabled: false })
probe.computeBoundingBox()
const scale = CAP_HEIGHT / (probe.boundingBox.max.y - probe.boundingBox.min.y)

const glyphs = [ ...TEXT ].map(ch =>
{
    let g = new TextGeometry(ch, { font, size: 1, depth: DEPTH / scale, curveSegments: 6, bevelEnabled: false })
    g.scale(scale, scale, scale)
    g.computeBoundingBox()
    const b = g.boundingBox
    const w = b.max.x - b.min.x, h = b.max.y - b.min.y
    // centrar en x/z; en y centrar también (el nodo se sube luego para apoyar en el suelo)
    g.translate(-(b.min.x + w / 2), -(b.min.y + h / 2), -(b.min.z + DEPTH / 2))
    g.deleteAttribute('uv')
    g = mergeVertices(g, 1e-4)
    return { ch, g, w, h }
})

// Posición baseline común: el fondo real de cada glifo (minY antes de centrar) se pierde al centrar,
// así que calculamos el desplazamiento respecto de la base de la "M" para respetar la línea base.
const baseRef = new TextGeometry('M', { font, size: 1, depth: 0.1, curveSegments: 6, bevelEnabled: false })
baseRef.computeBoundingBox()
const baselineMinY = baseRef.boundingBox.min.y * scale
glyphs.forEach((gl, i) =>
{
    const raw = new TextGeometry(gl.ch, { font, size: 1, depth: 0.1, curveSegments: 6, bevelEnabled: false })
    raw.computeBoundingBox()
    gl.rawMinY = raw.boundingBox.min.y * scale // puede ser < baseline (p/g) o > (vocales)
})

// --- GLB
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
if(useDraco)
{
    const draco3d = (await import('draco3dgltf')).default
    io.registerDependencies({
        'draco3d.decoder': await draco3d.createDecoderModule(),
        'draco3d.encoder': await draco3d.createEncoderModule()
    })
}
const doc = await io.read(input)
if(useDraco)
{
    const ext = doc.getRoot().listExtensionsUsed().find(e => e.extensionName === 'KHR_draco_mesh_compression')
    if(ext) ext.setEncoderOptions({ method: KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER, quantizationVolume: 'mesh', quantizePosition: 12, quantizeNormal: 6, quantizeTexcoord: 6, quantizeColor: 2, quantizeGeneric: 2 })
}
const root = doc.getRoot()
const buffer = root.listBuffers()[0]

// Letras originales ordenadas de izquierda a derecha (.019 → .010)
const nodes = root.listNodes()
    .filter(n => /^refLettersPhysicalDynamic\.\d+$/.test(n.getName()))
    .sort((a, b) => a.getTranslation()[0] - b.getTranslation()[0])
if(nodes.length < glyphs.length) throw new Error(`Hay ${nodes.length} letras originales y el texto necesita ${glyphs.length}`)

const first = nodes[0].getTranslation(), last = nodes[nodes.length - 1].getTranslation()
const dir = [ last[0] - first[0], last[2] - first[2] ]
const len = Math.hypot(...dir)
const d = [ dir[0] / len, dir[1] / len ]
const center = [ (first[0] + last[0]) / 2, (first[2] + last[2]) / 2 ]

// Ancho total y posición de cada letra a lo largo de la línea
const total = glyphs.reduce((s, g) => s + g.w, 0) + GAP * (glyphs.length - 1)
let cursor = -total / 2
glyphs.forEach(g => { g.s = cursor + g.w / 2; cursor += g.w + GAP })

const uvSource = nodes[0].getMesh().listPrimitives()[0].getAttribute('TEXCOORD_0').getElement(0, [])

const mk = (array, type) => doc.createAccessor().setArray(array).setType(type).setBuffer(buffer)

glyphs.forEach((gl, i) =>
{
    const node = nodes[i]
    const prim = node.getMesh().listPrimitives()[0]
    const old = [ prim.getAttribute('POSITION'), prim.getAttribute('NORMAL'), prim.getAttribute('TEXCOORD_0'), prim.getIndices() ]

    const pos = gl.g.getAttribute('position').array
    const nor = gl.g.getAttribute('normal').array
    const idx = gl.g.getIndex().array
    const count = pos.length / 3
    const uv = new Float32Array(count * 2)
    for(let k = 0; k < count; k++) { uv[k * 2] = uvSource[0]; uv[k * 2 + 1] = uvSource[1] }

    prim.setAttribute('POSITION', mk(new Float32Array(pos), 'VEC3'))
    prim.setAttribute('NORMAL', mk(new Float32Array(nor), 'VEC3'))
    prim.setAttribute('TEXCOORD_0', mk(uv, 'VEC2'))
    prim.setIndices(mk(count > 65535 ? new Uint32Array(idx) : new Uint16Array(idx), 'SCALAR'))
    old.forEach(a => a && a.dispose())

    // Posición: sobre la línea original; y apoyado en la línea base común
    const yCenter = GROUND_Y + (gl.rawMinY - baselineMinY) + gl.h / 2
    node.setTranslation([ center[0] + d[0] * gl.s, yCenter, center[1] + d[1] * gl.s ])

    const box = node.listChildren().find(c => /^cuboid/.test(c.getName()))
    box.setScale([ gl.w, gl.h, DEPTH - 0.018 ])
})

// Quitar letras sobrantes (nodo + colisionador + malla)
for(const node of nodes.slice(glyphs.length))
{
    const mesh = node.getMesh()
    node.listChildren().forEach(c => c.dispose())
    node.dispose()
    if(mesh)
    {
        mesh.listPrimitives().forEach(p => { [ ...p.listAttributes(), p.getIndices() ].forEach(a => a && a.dispose()); p.dispose() })
        mesh.dispose()
    }
}

await io.write(output, doc)
console.log(`OK: "${TEXT}" (${glyphs.length} letras, ${nodes.length - glyphs.length} sobrantes eliminadas) → ${output}`)
