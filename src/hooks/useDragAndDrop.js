export const useDragAndDrop = (list, setList) => {
  const handleDragEnd = ({ destination, source }) => {
    if (!destination) return;

    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    // 0(n)
    // const dragSuperHero = superHeroes.find((s) => s.id === draggableId);

    const newList = [...list];
    // 0(1)
    const [draggedItem] = newList.splice(sourceIndex, 1);
    newList.splice(destinationIndex, 0, draggedItem);

    setList(newList);
  };

  return {
    handleDragEnd,
  };
};
