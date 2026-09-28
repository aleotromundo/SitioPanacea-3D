import * as THREE from 'three/webgpu'

const text = `
 ██████╗ ████████╗██████╗  ██████╗ ███╗   ███╗██╗   ██╗███╗   ██╗██████╗  ██████╗
██╔═══██╗╚══██╔══╝██╔══██╗██╔═══██╗████╗ ████║██║   ██║████╗  ██║██╔══██╗██╔═══██╗
██║   ██║   ██║   ██████╔╝██║   ██║██╔████╔██║██║   ██║██╔██╗ ██║██║  ██║██║   ██║
██║   ██║   ██║   ██╔══██╗██║   ██║██║╚██╔╝██║██║   ██║██║╚██╗██║██║  ██║██║   ██║
╚██████╔╝   ██║   ██║  ██║╚██████╔╝██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██████╔╝╚██████╔╝
 ╚═════╝    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═════╝  ╚═════╝


╔═ Intro ═══════════════╗
║ ¡Gracias por visitar mi portafolio, desarrollador curioso!
║ Si te interesa la tecnología y cómo construí este proyecto, acá tenés todo lo que necesitás saber.
╚═══════════════════════╝

╔═ Enlaces ═════════════╗
║ GitHub ⇒ https://github.com/aleotromundo/SitioPanacea-3D
╚═══════════════════════╝

╔═ Depuración ══════════╗
║ Podés entrar al modo debug agregando #debug al final de la URL y recargando.
║ Presioná [V] para alternar la cámara libre.
╚═══════════════════════╝

╔═ Three.js ════════════╗
║ Three.js es la biblioteca que se usa para renderizar este mundo 3D (versión: ${THREE.REVISION})
║ https://threejs.org/
║ La creó mr.doob (https://x.com/mrdoob, https://github.com/mrdoob),
║ y la siguen cientos de desarrolladores geniales,
║ entre ellos Sunag (https://x.com/sea3dformat, https://github.com/sunag), que sumó TSL,
║ lo que permite usar WebGL y WebGPU y hace posible este portafolio.
╚═══════════════════════╝

╔═ Basado en Folio 2025 ╗
║ Este mundo parte del portafolio Folio 2025 de Bruno Simon (licencia MIT).
║ https://github.com/brunosimon/folio-2025
║ Él documentó cómo lo construyó en su canal de YouTube.
╚═══════════════════════╝

╔═ Código fuente ═══════╗
║ El código de Otro Mundo está disponible en GitHub bajo licencia MIT.
║ https://github.com/aleotromundo/SitioPanacea-3D
╚═══════════════════════╝

╔═ Música ══════════════╗
║ La música de este mundo fue creada especialmente por Kounine (Linktree).
║ https://linktr.ee/Kounine
║ Está publicada bajo licencia CC0: podés usarla como quieras.
╚═══════════════════════╝

╔═ Más enlaces ═════════╗
║ Rapier (física)  ⇒ https://rapier.rs/
║ Howler.js (audio) ⇒ https://howlerjs.com/
║ Amatic SC (fuente) ⇒ https://fonts.google.com/specimen/Amatic+SC
║ Nunito (fuente)    ⇒ https://fonts.google.com/specimen/Nunito?query=Nunito
╚═══════════════════════╝
`
let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]

    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'

        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]