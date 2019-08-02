import { BaseModule } from './BaseModule'
import _ from 'lodash'

export class Resize extends BaseModule {
  onCreate = () => {
    // track resize handles
    this.boxes = []
    this.debouncedUpdate = _.debounce(this.requestUpdate, 10)

    // add 4 resize handles
    this.addBox('nwse-resize') // top left
    this.addBox('nesw-resize') // top right
    this.addBox('nwse-resize') // bottom right
    this.addBox('nesw-resize') // bottom left
    window.addEventListener('resize', this.debouncedUpdate, false)
    this.positionBoxes()
  }

  onDestroy = () => {
    // reset drag handle cursors
    this.setCursor('')
    window.removeEventListener('resize', this.debouncedUpdate)
  }

  positionBoxes = () => {
    const handleXOffset = `${-parseFloat(this.options.handleStyles.width) / 2}px`
    const handleYOffset = `${-parseFloat(this.options.handleStyles.height) / 2}px`

    // set the top and left for each drag handle
    const coords = [
      { left: handleXOffset, top: handleYOffset }, // top left
      { right: handleXOffset, top: handleYOffset }, // top right
      { right: handleXOffset, bottom: handleYOffset }, // bottom right
      { left: handleXOffset, bottom: handleYOffset } // bottom left
    ]

    coords.forEach((pos, idx) => {
      Object.assign(this.boxes[idx].style, pos)
    })
  }

  addBox = (cursor) => {
    // create div element for resize handle
    const box = document.createElement('div')

    // Star with the specified styles
    Object.assign(box.style, this.options.handleStyles)
    box.style.cursor = cursor

    // Set the width/height to use 'px'
    box.style.width = `${this.options.handleStyles.width}px`
    box.style.height = `${this.options.handleStyles.height}px`

    // listen for mousedown on each box
    box.addEventListener('touchstart', this.handleMousedown, false)
    box.addEventListener('mousedown', this.handleMousedown, false)
    // add drag handle to document
    this.overlay.appendChild(box)
    // keep track of drag handle
    this.boxes.push(box)
  }

  handleMousedown = (evt) => {
    // note which box
    this.dragBox = evt.target
    // note starting mousedown position
    if (evt.type === 'mousedown') {
      this.dragStartX = evt.clientX
    } else {
      this.dragStartX = evt.touches[0].clientX
    }

    // store the width before the drag
    this.preDragWidth = this.img.width || this.img.naturalWidth
    // set the proper cursor everywhere
    this.setCursor(this.dragBox.style.cursor)
    // listen for movement and mouseup
    document.addEventListener('touchmove', this.handleDrag, false)
    document.addEventListener('mousemove', this.handleDrag, false)
    document.addEventListener('touchend', this.handleMouseup, false)
    document.addEventListener('mouseup', this.handleMouseup, false)
  }

  handleMouseup = () => {
    // reset cursor everywhere
    this.setCursor('')
    // stop listening for movement and mouseup
    document.removeEventListener('touchmove', this.handleDrag)
    document.removeEventListener('mousemove', this.handleDrag)
    document.removeEventListener('touchend', this.handleMouseup)
    document.removeEventListener('mouseup', this.handleMouseup)
  }

  handleDrag = (evt) => {
    if (!this.img) {
      // image not set yet
      return
    }
    // update image size
    let deltaX
    if (evt.type === 'mousemove') {
      deltaX = evt.clientX - this.dragStartX
    } else {
      deltaX = evt.changedTouches[0].clientX - this.dragStartX
    }

    if (this.dragBox === this.boxes[0] || this.dragBox === this.boxes[3]) {
      // left-side resize handler dragging right shrinks image
      this.img.width = Math.round(this.preDragWidth - deltaX)
    } else {
      // right-side resize handler dragging right enlarges image
      this.img.width = Math.round(this.preDragWidth + deltaX)
    }
    this.requestUpdate()
  }

  setCursor = (value) => {
    [
      document.body,
      this.img
    ].forEach((el) => {
      el.style.cursor = value // eslint-disable-line no-param-reassign
    })
  }
}
