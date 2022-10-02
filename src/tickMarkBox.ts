import { resizeTarget, Scale } from "./classes"

// const box = document.querySelector("#tickmark-generator-box")

const modeSelector: HTMLSelectElement | null = document.querySelector("#mode-selector")

const startDeltaInput: HTMLInputElement | null = document.querySelector("#tickmark-startdelta")
const intervalInput: HTMLInputElement | null = document.querySelector("#tickmark-interval")
const amountInput: HTMLInputElement | null = document.querySelector("#tickmark-amount")

const amountOptionsDiv: HTMLDivElement = document.querySelector("#generate-amount") as HTMLDivElement
const intervalOptionsDiv: HTMLDivElement = document.querySelector("#generate-interval") as HTMLDivElement

const out: HTMLParagraphElement = document.querySelector("#tickmark-generator-output") as HTMLParagraphElement

if (!startDeltaInput || !intervalInput || !amountInput || !modeSelector || !out || !amountOptionsDiv || !intervalOptionsDiv) throw "Input Element Not Found"

out.onclick = ()=>navigator.clipboard.writeText(out.innerHTML)

class TickMarkGeneratorBox {
    private scale: Scale;

    constructor(scale: Scale) {
        this.scale = scale;

        modeSelector?.addEventListener("change", (() => {
            if ((modeSelector?.value as "interval" || "amount") == "interval") {
                amountOptionsDiv.hidden = true;
                intervalOptionsDiv.hidden = false;
            } else {
                amountOptionsDiv.hidden = false;
                intervalOptionsDiv.hidden = true;
            }
            this.updateTickMarks.bind(this)
        }).bind(this))
        startDeltaInput?.addEventListener("change", this.updateTickMarks.bind(this))
        intervalInput?.addEventListener("change", this.updateTickMarks.bind(this))
        amountInput?.addEventListener("change", this.updateTickMarks.bind(this))

        resizeTarget.addEventListener("update", this.updateTickMarks.bind(this))

        this.updateTickMarks()
        if ((modeSelector?.value as "interval" || "amount") == "interval") {
            amountOptionsDiv.hidden = true;
            intervalOptionsDiv.hidden = false;
        } else {
            amountOptionsDiv.hidden = false;
            intervalOptionsDiv.hidden = true;
        }
    }
    updateTickMarks() {
        console.log("updating...")
        out.innerHTML = this.scale.generateTickMarkers(
            modeSelector?.value as "interval" || "amount",
            amountInput?.valueAsNumber,
            intervalInput?.valueAsNumber,
            startDeltaInput?.valueAsNumber
        ).toString()
    }
}


export {TickMarkGeneratorBox};