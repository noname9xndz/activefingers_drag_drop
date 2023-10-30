import AbstractPlugin from 'shared/AbstractPlugin';
import {requestNextAnimationFrame, AutoBind} from 'shared/utils';
import {FixMeAny} from 'shared/types';

import {MirrorCreatedEvent} from '../../Draggable/Plugins/Mirror/MirrorEvent';
import {
  DragOverEvent,
  DragOverContainerEvent,
  isDragOverEvent,
} from '../../Draggable/DragEvent';

/**
 * ResizeMirror default options
 * @property {Object} defaultOptions
 * @type {Object}
 */
export const defaultOptions = {};

/**
 * The ResizeMirror plugin resizes the mirror element to the dimensions of the draggable element that the mirror is hovering over
 * @class ResizeMirror
 * @module ResizeMirror
 * @extends AbstractPlugin
 */
export default class ResizeMirror extends AbstractPlugin {
  private lastWidth: number;
  private lastHeight: number;
  private mirror: HTMLElement | null;
  /**
   * ResizeMirror constructor.
   * @constructs ResizeMirror
   * @param {Draggable} draggable - Draggable instance
   */
  constructor(draggable: FixMeAny) {
    super(draggable);

    /**
     * ResizeMirror remembers the last width when resizing the mirror
     * to avoid additional writes to the DOM
     * @property {number} lastWidth
     */
    this.lastWidth = 0;

    /**
     * ResizeMirror remembers the last height when resizing the mirror
     * to avoid additional writes to the DOM
     * @property {number} lastHeight
     */
    this.lastHeight = 0;

    /**
     * Keeps track of the mirror element
     * @property {HTMLElement} mirror
     */
    this.mirror = null;
  }

  /**
   * Attaches plugins event listeners
   */
  attach() {
    this.draggable
      .on('mirror:created', this.onMirrorCreated)
      .on('drag:over', this.onDragOver)
      .on('drag:over:container', this.onDragOver);
  }

  /**
   * Detaches plugins event listeners
   */
  detach() {
    this.draggable
      .off('mirror:created', this.onMirrorCreated)
      .off('mirror:destroy', this.onMirrorDestroy)
      .off('drag:over', this.onDragOver)
      .off('drag:over:container', this.onDragOver);
  }

  /**
   * Returns options passed through draggable
   * @return {Object}
   */
  getOptions() {
    return this.draggable.options.resizeMirror || {};
  }

  /**
   * Mirror created handler
   * @param {MirrorCreatedEvent} mirrorEvent
   * @private
   */
  @AutoBind
  private onMirrorCreated({mirror}: MirrorCreatedEvent) {
    this.mirror = mirror;
  }

  /**
   * Mirror destroy handler
   * @param {MirrorDestroyEvent} mirrorEvent
   * @private
   */
  @AutoBind
  private onMirrorDestroy() {
    this.mirror = null;
  }

  /**
   * Drag over handler
   * @param {DragOverEvent | DragOverContainer} dragEvent
   * @private
   */
  @AutoBind
  private onDragOver(dragEvent: DragOverEvent | DragOverContainerEvent) {
    this.resize(dragEvent);
  }

  /**
   * Resize function for
   * @param {DragOverEvent | DragOverContainer} dragEvent
   * @private
   */
  private resize(dragEvent: DragOverEvent | DragOverContainerEvent) {
    requestAnimationFrame(() => {
      let over: HTMLElement | null = null;
      const {overContainer} = dragEvent;

      if (this.mirror == null || this.mirror.parentNode == null) {
        return;
      }

      if (this.mirror.parentNode !== overContainer) {
        overContainer.appendChild(this.mirror);
      }

      if (isDragOverEvent(dragEvent)) {
        over = dragEvent.over;
      }

      const overElement =
        over ||
        this.draggable.getDraggableElementsForContainer(overContainer)[0];

      if (!overElement) {
        return;
      }

      requestNextAnimationFrame(() => {
        const overRect = overElement.getBoundingClientRect();

        if (
          this.mirror == null ||
          (this.lastHeight === overRect.height &&
            this.lastWidth === overRect.width)
        ) {
          return;
        }

        this.mirror.style.width = `${overRect.width}px`;
        this.mirror.style.height = `${overRect.height}px`;

        this.lastWidth = overRect.width;
        this.lastHeight = overRect.height;
      });
    });
  }
}
