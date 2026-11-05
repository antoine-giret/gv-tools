import { IControl } from 'maplibre-gl';

export class LegendControl implements IControl {
  private container?: HTMLDivElement;
  private legendContainer?: HTMLDivElement;
  readonly legendContent = document.createElement('div');
  private isOpen = false;

  onAdd(): HTMLElement {
    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

    const toggleButton = document.createElement('button');
    toggleButton.className = 'maplibregl-ctrl-icon legend-toggle';
    toggleButton.setAttribute('type', 'button');
    toggleButton.setAttribute('title', 'Toggle legend');
    toggleButton.setAttribute('aria-label', 'Toggle legend');
    toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-black/70">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
      </svg>

    `;
    toggleButton.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    `;

    this.legendContainer = document.createElement('div');
    this.legendContainer.style.cssText = `
      display: ${this.isOpen ? 'block' : 'none'};
      position: absolute;
      top: 40px;
      right: 0;
      background: white;
      border-radius: 4px;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
      z-index: 1;
    `;

    this.legendContainer.appendChild(this.legendContent);

    toggleButton.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      if (this.legendContainer) {
        this.legendContainer.style.display = this.isOpen ? 'block' : 'none';
      }
    });

    this.container.appendChild(toggleButton);
    this.container.appendChild(this.legendContainer);

    return this.container;
  }

  onRemove(): void {
    this.container?.remove();
  }
}
