export default class Card {
  constructor(id, text, parentColumn) {
    this.id = id;
    this.text = text;
    this.parentColumn = parentColumn;
    this.element = null;
  }

  render() {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.dataset.id = this.id;
    cardElement.textContent = this.text;

    // Добавляем кнопку удаления
    const deleteButton = document.createElement("span");
    deleteButton.className = "delete-icon";
    deleteButton.textContent = "×"; //"\u274C";
    deleteButton.addEventListener("click", () => this.delete());
    cardElement.append(deleteButton);

    // Перетаскивание
    cardElement.draggable = true;
    cardElement.addEventListener("dragstart", this.handleDragStart.bind(this));
    cardElement.addEventListener("dragend", this.handleDragEnd.bind(this));

    this.element = cardElement;
    return cardElement;
  }

  delete() {
    this.parentColumn.removeCard(this.id);
  }

  handleDragStart(event) {
    event.dataTransfer.setData("text/source-card-id", this.id);
    event.dataTransfer.effectAllowed = "move";
    event.target.style.cursor = "grabbing";
    this.element.style.cursor = "grabbing";
  }

  handleDragEnd(event) {
    event.target.style.cursor = "grab";
  }
}
