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

    const deleteButton = document.createElement("span");
    deleteButton.className = "delete-icon";
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => this.delete());
    cardElement.append(deleteButton);

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
    event.dataTransfer.setData("text/source-col-id", this.parentColumn.index);    
    event.dataTransfer.effectAllowed = "move";
    this.parentColumn.draggedCard = this;

    // Добавляем класс для CSS
    this.element.classList.add("dragging");    
  }

  handleDragEnd(event) {
    // Убираем класс
    this.element.classList.remove("dragging");
  }
}