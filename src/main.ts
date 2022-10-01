import './style.css'
import { Range, Scale, redrawTarget, resizeTarget } from "./classes"
import { DraggableBox } from './draggable'

const canvas = (document.querySelector("canvas") as HTMLCanvasElement)
const ctx = (canvas.getContext('2d') as CanvasRenderingContext2D)
if (ctx === null) throw 'Invalid Canvas'
ctx?.save()

const configBox: HTMLDivElement | null = document.querySelector('#config-box')
const draggableBox = new DraggableBox(configBox)

draggableBox

const minMaxButton: HTMLDivElement | null = document.querySelector('#min-max-config');
minMaxButton?.addEventListener('click', _ev => {
  configBox?.childNodes.forEach(e => {
    if (e.nodeName == "DIV" && (e as HTMLDivElement).id != "min-max-config") {
      if ((minMaxButton.firstElementChild as Element).textContent == "-") {
        (e as HTMLDivElement).classList.add("hide")
      } else {
        (e as HTMLDivElement).classList.remove("hide")
      }
    }
  })
  minMaxButton.firstElementChild?.innerHTML == '-'
    ? minMaxButton.firstElementChild.innerHTML = '+'
    : (minMaxButton.firstElementChild as Element).innerHTML = '-'

})

const addRangeButton: HTMLDivElement | null = document.querySelector("#add-range")
const rangeContainer: HTMLDivElement = (document.querySelector('#range-input-container') as HTMLDivElement)

const ranges: Range[] = getRanges()

const scaleRangeDivX = document.querySelector('#scale')
let scale = Scale.fromValues((scaleRangeDivX as HTMLDivElement)) || new Scale(-1, 1, (scaleRangeDivX as HTMLDivElement))


function resize() {
  canvas.width = canvas?.clientWidth
  canvas.height = canvas?.clientHeight

  ctx?.restore()
  ctx?.translate(0, canvas.height / 2)
  ctx?.scale(canvas.width / scale.delta(), -1)
  ctx?.translate(-scale.start, 0)

  update()
}


// refactor to remove from main
function update() {
  ctx?.save()
  ctx?.clearRect(scale.start, -canvas.height / 2, scale.delta(), canvas.height)
  let i = 0;

  ctx.fillStyle = 'rgb(0,10,20)'
  ctx.fill(scale.draw(canvas, 5, 15))

  // draw tick mark labels
  for (let marker of scale.tickMarkers) {
    ctx?.save()
    ctx.font = '15px consolas'
    if (marker < scale.start + (scale.delta() / 2)) {
      ctx.textAlign = 'left'
    } else if (marker - scale.start + (scale.delta() / 2) < Number.EPSILON) {
      ctx.textAlign = 'center'
    } else {
      ctx.textAlign = 'right'
    }
    ctx.fillStyle = 'black'
    ctx?.translate(marker, -20)
    ctx?.scale(scale.delta() / canvas?.width, -1)
    ctx?.fillText(marker.toString(), 0, 0)
    ctx?.restore()
  }

  for (let range of ranges) {
    i += 50;
    ctx?.translate(0, 50)
    // draw range
    ctx.fillStyle = range.color || 'black'
    ctx?.fill(range.draw(canvas, 5, 15, scale))
    ctx?.beginPath()

    // draw line coming down from range
    ctx.strokeStyle = range.color || 'black'
    ctx.lineWidth = 5 * scale.delta() / canvas.width
    ctx.setLineDash([0.2, 0.3])
    ctx?.moveTo(range.start + (range.delta() / 2), 0)
    ctx?.lineTo(range.start + (range.delta() / 2), -i)
    ctx?.closePath()
    ctx?.stroke()

    // add labels
    ctx?.save()
    ctx?.translate(range.start + (range.delta() / 2), 15)
    ctx?.scale(scale.delta() / canvas?.width, -1)
    ctx.textAlign = 'start'
    const splitText = range.label?.split(/(_\{.*\})/g);
    let totalDisplacement = 0;
    splitText?.forEach(v => {
      totalDisplacement += v.includes("_")
        ? v.replaceAll(/_|{|}/g, "").length * 4
        : v.length * 12
    })
    let displacement = -totalDisplacement / 2;
    splitText?.forEach(v => {
      if (v.includes("_")) {
        v = v.replaceAll(/_|{|}/g, "")
        ctx.font = '15px consolas'
        ctx?.fillText(v || '', displacement, 5)
        // this is a mediocre ratio (px font size)/1 (displacement)
        displacement += v.length * 5
      } else {
        ctx.font = '25px consolas'
        ctx?.fillText(v || '', displacement, 0)
        displacement += v.length * 12.5
      }
    })
    ctx?.restore()

  }
  ctx?.restore()
}

function addNewRange(): void {
  // console.log("I'm adding a new range!")
  ranges.push(new Range(-Math.random(), Math.random(), rangeContainer, ' ', '#000'))
  console.log(ranges)
  update()
}

function storeRanges(): void {
  window.localStorage.setItem("ranges", JSON.stringify(ranges.map<Object>(v => {
    return {
      start: v.start,
      end: v.end,
      color: v.color,
      label: v.label
    }
  })))
}

function getRanges(): Range[] {
  if (window.localStorage.getItem("ranges")) {
    return (JSON.parse(
      (window.localStorage.getItem("ranges") as string)) as { start: number, end: number, color: string, label: string }[]).map(v => {
        try {
          if (v.start == null || v.end == null) throw "Null Values"
          return new Range(v.start, v.end, rangeContainer, v.label, v.color);
        } catch {
          return null
        }
      }).filter(v => v != null) as Range[]
  }
  console.log('HI?!')
  return []
}


addRangeButton?.addEventListener("click", addNewRange)
resize();
window.addEventListener('resize', resize)

redrawTarget.addEventListener("update", update)
resizeTarget.addEventListener("update", resize)

// autosave
setInterval(() => {
  storeRanges()
  scale.storeValues();
}, 2000)