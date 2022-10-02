// repurposed from: https://www.w3schools.com/howto/howto_js_draggable.asp
class DraggableBox {
    private div: HTMLDivElement;
    private pos: { x: number, y: number, a: number, b: number }

    constructor(div: HTMLDivElement | null) {
        if (div == null) throw "Null Div";
        this.div = div;
        const configBoxLocation = window.localStorage.getItem('configBoxLocation')
        if (configBoxLocation) {
            let parsed: {top: number, left: number} = JSON.parse(configBoxLocation);
            if (configBoxLocation) {
                this.div.style.top = parsed.top.toString()+"px";
                this.div.style.left = parsed.left.toString()+"px";
            }
        }
        this.pos = { x: 0, y: 0, a: 0, b: 0 }

        this.div.addEventListener("mousedown", this.dragMouseDown.bind(this));
    }
    dragMouseDown(ev: MouseEvent) {

        this.pos.a = ev.clientX;
        this.pos.b = ev.clientY;
        document.onmouseup = this.closeDragElement.bind(this);
        document.onmousemove = this.elementDrag.bind(this);
    }
    closeDragElement(_ev: MouseEvent) {
        document.onmouseup = null;
        document.onmousemove = null;
    }
    elementDrag(ev: MouseEvent) {
        // ev.preventDefault();
        // calculate the new cursor position:
        this.pos.x = this.pos.a - ev.clientX;
        this.pos.y = this.pos.b - ev.clientY;
        this.pos.a = ev.clientX;
        this.pos.b = ev.clientY;
        // set the element's new position:
        this.div.style.top = (this.div.offsetTop - this.pos.y) + "px";
        this.div.style.left = (this.div.offsetLeft - this.pos.x) + "px";
    }
    store() {
        window.localStorage.setItem("configBoxLocation", JSON.stringify({
            top: this.div.style.top,
            left: this.div.style.left
        }))
    }
}

export { DraggableBox }