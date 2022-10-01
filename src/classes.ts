const redrawTarget = new EventTarget()
const redrawEvent = new CustomEvent("update")

const resizeTarget = new EventTarget()
const resizeEvent = new CustomEvent("update")

class Range {
  public start: number;
  public end: number;
  private inputStart: HTMLInputElement;
  private inputEnd: HTMLInputElement;
  public color: string | undefined;
  private inputColor: HTMLInputElement | undefined;
  protected container: HTMLDivElement;
  private parent: HTMLDivElement;
  protected event: CustomEvent;
  protected eventTarget: EventTarget;
  public label: string | undefined;
  protected inputLabel: HTMLInputElement | undefined;
  // private mode: 'Symmetric' | 'StartEnd';
  
  constructor(start:number, end:number, parent: HTMLDivElement, label?: string, color?: string) {
      if (start == null || end == null || start >= end) {
        throw "Start has to be smaller than the end"
      }
      this.start = start;
      this.end = end;

      this.event = redrawEvent;
      this.eventTarget = redrawTarget;

      this.parent = parent;
      this.container = document.createElement("div")
      this.inputStart = document.createElement("input")
      this.inputEnd = document.createElement("input")
      if (color) {
        this.color = color
        this.inputColor = document.createElement("input")
        this.inputColor.value = color
      }
      if (label) {
        this.label = label
        this.inputLabel = document.createElement("input")
        this.inputLabel.value = label
      }
      this.initializeHTML();
  }
  private initializeHTML() {
    this.container.style.display = "flex"
    this.container.style.flexFlow = "row nowrap"

    this.inputStart.setAttribute("type","number")
    this.inputEnd.setAttribute("type","number")
    this.inputStart.setAttribute("value",this.start.toString())
    this.inputEnd.setAttribute("value",this.end.toString())
    this.inputStart.setAttribute("placeholder","Start")
    this.inputEnd.setAttribute("placeholder","End")

    this.inputStart.addEventListener("keyup", () => {
      this.update(this.inputStart.valueAsNumber, null)
      this.eventTarget.dispatchEvent(this.event)
    })
    this.inputStart.addEventListener("change", () => {
      this.update(this.inputStart.valueAsNumber, null)
      this.eventTarget.dispatchEvent(this.event)
    })
    this.inputEnd.addEventListener("keyup", () => {
      this.update(null, this.inputEnd.valueAsNumber)
      this.eventTarget.dispatchEvent(this.event)
    })
    this.inputEnd.addEventListener("change", () => {
      this.update(null, this.inputEnd.valueAsNumber)
      this.eventTarget.dispatchEvent(this.event)
    })
    this.container.appendChild(this.inputStart)
    this.container.appendChild(this.inputEnd)

    if (this.inputColor) {
      this.inputColor.setAttribute("type","color")
      this.inputColor.addEventListener("change", () => {
        this.color = this.inputColor?.value
        this.eventTarget.dispatchEvent(this.event)
      })
      this.container.appendChild(this.inputColor)
    }
    
    if (this.inputLabel) {
      this.inputLabel.setAttribute("type","text")
      this.inputLabel.setAttribute("placeholder","label")
      this.inputLabel.addEventListener("change", () => {
        this.label = this.inputLabel?.value
        console.log(this.label)
        this.eventTarget.dispatchEvent(this.event)
      })
      this.container.appendChild(this.inputLabel)
    }
    
    this.parent.appendChild(this.container)
  }
  public update(start:number|null, end:number|null) {
      if ((start ?? this.start) >= (end ?? this.end)) {
        throw "Start has to be larger than the end"
      }
      // console.log("I got updated :D")
      this.start = start ?? this.start;
      this.end = end ?? this.end;
  }
  public delta(): number {
    return this.end - this.start
  }
  public draw(canvas: HTMLCanvasElement, lineWidth=5, tickHeight=10, scale: Scale): Path2D {
    const path = new Path2D()
    // line
    path.rect(
      this.start,
      -lineWidth/2,
      this.delta(),
      lineWidth
    )
    // start tick
    path.rect(
      this.start - lineWidth*scale.delta()/(2*canvas.width),
      -tickHeight/2,
      lineWidth*scale.delta()/canvas.width,
      tickHeight
    )
    // // end tick
    path.rect(
      this.end - lineWidth*scale.delta()/(2*canvas.width),
      -tickHeight/2,
      lineWidth*scale.delta()/canvas.width,
      tickHeight
    )
    return path;
  }
}

class Scale extends Range {
  public tickMarkers: number[];
  private tickMarkerInput: HTMLInputElement;

  constructor(start:number, end:number, parent: HTMLDivElement) {
    super(start, end, parent)
    this.event = resizeEvent
    this.eventTarget = resizeTarget
    
    this.tickMarkers = []
    
    this.tickMarkerInput = document.createElement("input")
    this.tickMarkerInput.setAttribute("type","text")

    // initialize with some tick marks
    this.tickMarkerInput.value = this.generateTickMarkers("amount",11).toString();
    this.tickMarkers = this.generateTickMarkers("amount",11);

    this.tickMarkerInput.addEventListener("keyup", () => {
      this.tickMarkers = this.tickMarkerInput.value.split(',').map(v=>Number(v))
      redrawTarget.dispatchEvent(redrawEvent)
    })
    this.tickMarkerInput.addEventListener("change", () => {
      this.tickMarkers = this.tickMarkerInput.value.split(',').map(v=>Number(v))
      redrawTarget.dispatchEvent(redrawEvent)
    })
    this.container.appendChild(this.tickMarkerInput)
  }
  public draw(canvas: HTMLCanvasElement, lineWidth=5, tickHeight=10): Path2D {
    const path = new Path2D()
    path.rect(this.start,-lineWidth/2,this.delta(),lineWidth)
    for (let marker of this.tickMarkers) {
      path.rect(
        marker - (lineWidth*this.delta()/(2*canvas.width)),
        -tickHeight/2,
        lineWidth*this.delta()/canvas.width,
        tickHeight
      )
    }
    return path
  }
  public generateTickMarkers(mode:'amount'|'interval', amount?:number, interval?:number, startDelta?:number) {
    if (mode == "amount" && amount) {
      return (Array<number>(amount)).fill(0).map((_v,i) => {
        return Math.round(((i*this.delta()/(amount - 1))+this.start + Number.EPSILON) * 100) / 100
      })
    } else if (mode == "interval" && interval) {
      const ticks = [];
      let i = this.start + (startDelta || 0);
      while (i <= this.end) {
        ticks.push(i)
        i += interval
      }
      return ticks
    } else {
      throw "generateTickMarkers needs to meet mode requirements"
    }
  }
  public update(start:number|null, end:number|null) {
    if ((start ?? this.start) >= (end ?? this.end)) {
      throw "Start has to be larger than the end"
    }
    // console.log("I got updated :D")
    this.start = start ?? this.start;
    this.end = end ?? this.end;

    //auto gen tick marks: fix later
    this.tickMarkerInput.value = this.generateTickMarkers("amount",11).toString();
    this.tickMarkers = this.generateTickMarkers("amount",11);
  }
  public storeValues() {
    window.localStorage.setItem("scale", JSON.stringify({
      start: this.start,
      end: this.end,
      tickMarkers: this.tickMarkers
    }))
  }
  static fromValues(parent: HTMLDivElement) {
    let raw = window.localStorage.getItem("scale")
    if (!raw) return;
    let parsed = JSON.parse(raw);
    console.log(parsed);
    if (!parsed || !parsed.start || !parsed.end) return;
    const scale = new Scale(parsed.start,parsed.end, parent)
    scale.tickMarkers = parsed.tickMarkers;
    return scale;
  }
}


export {Range, Scale, redrawTarget, resizeTarget}