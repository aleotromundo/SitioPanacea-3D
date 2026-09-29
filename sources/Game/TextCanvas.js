import * as THREE from 'three/webgpu'

let top = 0
export class TextCanvas
{
    constructor(
        fontFamily = 'Comic Sans',
        fontWeight = '400',
        fontSize = 10,
        width = null,
        height = null,
        density = 1,
        horizontalAlign = 'center',
        lineHeight = 1
    )
    {
        this.lines = []
        this.fontFamily = fontFamily
        this.fontWeight = fontWeight
        this.fontSize = fontSize * density
        this.font = `${fontWeight} ${this.fontSize}px "${fontFamily}"`
        this.width = Math.ceil(width * density)
        this.height = Math.ceil(height * density)
        this.horizontalAlign = horizontalAlign
        this.lineHeight = lineHeight * density

        this.setCanvas()
        this.setTexture()
    }

    setCanvas()
    {
        this.canvas = document.createElement('canvas')
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.canvas.style.position = 'fixed'
        this.canvas.style.zIndex = 999
        this.canvas.style.top = `${top}px`
        this.canvas.style.left = 0
        top += this.height + 10
        // document.body.append(this.canvas)

        this.context = this.canvas.getContext('2d')
        this.context.font = this.font
    }

    setTexture()
    {
        this.texture = new THREE.Texture(this.canvas)
        this.texture.colorSpace = THREE.SRGBColorSpace
        this.texture.minFilter = THREE.NearestFilter
        this.texture.magFilter = THREE.NearestFilter
        this.texture.flipY = false
        this.texture.generateMipmaps = false
    }

    updateText(text)
    {
        this.lines = []

        if(typeof text === 'string')
            this.lines.push(text)
        else if(text instanceof Array)
            this.lines = text

        this.draw()
    }

    getMeasure()
    {
        const output = {}
        output.width = 0
        
        for(const line of this.lines)
        {
            const measure = this.context.measureText(line)

            if(measure.width > output.width)
                output.width = measure.width
        }

        return output
    }

    draw()
    {
        // Clear
        this.context.fillStyle = '#000000'
        this.context.fillRect(0, 0, this.width, this.height)

        // The text lives in a fixed-size mesh texture. Fit it to the available
        // pixels instead of letting Canvas2D silently crop long labels.
        const padding = Math.max(8, this.width * 0.04)
        const maxWidth = this.width - padding * 2
        const maxLines = Math.max(1, Math.floor(this.height / this.lineHeight))
        let fontSize = this.fontSize
        let lines = this.lines.slice()

        const wrapLines = () =>
        {
            const wrapped = []
            for(const line of lines)
            {
                const words = String(line).trim().split(/\s+/).filter(Boolean)
                if(words.length === 0)
                {
                    wrapped.push('')
                    continue
                }

                let current = ''
                for(const word of words)
                {
                    const candidate = current ? `${current} ${word}` : word
                    if(current && this.context.measureText(candidate).width > maxWidth)
                    {
                        wrapped.push(current)
                        current = word
                    }
                    else
                        current = candidate
                }
                if(current)
                    wrapped.push(current)
            }
            return wrapped
        }

        do
        {
            this.context.font = `${this.fontWeight} ${fontSize}px "${this.fontFamily}"`
            lines = wrapLines()
            if(lines.length <= maxLines && lines.every(line => this.context.measureText(line).width <= maxWidth))
                break
            fontSize *= 0.9
        }
        while(fontSize > this.fontSize * 0.45)

        this.context.font = `${this.fontWeight} ${fontSize}px "${this.fontFamily}"`
        lines = wrapLines()

        // Unbreakable strings (URLs/IDs) get an ellipsis rather than a hard crop.
        if(lines.length > maxLines)
            lines = lines.slice(0, maxLines)
        lines = lines.map(line =>
        {
            if(this.context.measureText(line).width <= maxWidth)
                return line
            let output = line
            while(output.length > 1 && this.context.measureText(`${output}…`).width > maxWidth)
                output = output.slice(0, -1)
            return `${output}…`
        })

        this.context.textAlign = this.horizontalAlign
        this.context.textBaseline = 'middle'
        this.context.fillStyle = '#ffffff'

        let i = 0
        for(const line of lines)
        {
            // const y = this.height / (this.lines.length + 1) * (i + 1)
            const y = this.height / 2 + (i - (lines.length - 1) / 2) * this.lineHeight

            let x = null
            if(this.horizontalAlign === 'center')
                x = this.width / 2
            else if(this.horizontalAlign === 'left')
                x = 0
            else if(this.horizontalAlign === 'right')
                x = this.width

            this.context.fillText(line, x, y)

            i++
        }

        this.texture.needsUpdate = true
    }
}
