import React, { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FaEye, FaEyebrow, FaLips, FaNose, FaUser } from "react-icons/fa";
import { MdUndo, MdDelete, MdColorLens } from "react-icons/md";

const BodyPart = ({ type, src, onDrop }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "bodyPart",
    item: { type, src },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`cursor-move p-2 border rounded ${isDragging ? "opacity-50" : ""}`}
    >
      <img src={src} alt={type} className="w-12 h-12 object-contain" />
    </div>
  );
};

const SketchBoard = () => {
  const [placedParts, setPlacedParts] = useState([]);
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: "bodyPart",
    drop: (item, monitor) => {
      const offset = monitor.getSourceClientOffset();
      setPlacedParts((prev) => [
        ...prev,
        { ...item, id: Date.now(), x: offset.x, y: offset.y },
      ]);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const handleUndo = () => {
    setPlacedParts((prev) => prev.slice(0, -1));
  };

  const handleDelete = (id) => {
    setPlacedParts((prev) => prev.filter((part) => part.id !== id));
  };

  return (
    <div
      ref={drop}
      className={`w-full h-96 border-2 relative ${canDrop ? "border-blue-500" : "border-gray-300"} ${isOver ? "bg-blue-100" : "bg-white"}`}
    >
      {placedParts.map((part) => (
        <div
          key={part.id}
          className="absolute cursor-move"
          style={{ left: part.x, top: part.y }}
        >
          <img src={part.src} alt={part.type} className="w-16 h-16 object-contain" />
          <button
            onClick={() => handleDelete(part.id)}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            aria-label="Delete part"
          >
            <MdDelete />
          </button>
        </div>
      ))}
    </div>
  );
};

const SketchingBoardComponent = () => {
  const bodyParts = [
    { type: "eye", src: "https://images.unsplash.com/photo-1544534285-1ab17deec1cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZXllfHx8fHx8MTcwNTY1NjQ3OQ&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080" },
    { type: "eyebrow", src: "https://images.unsplash.com/photo-1594837844961-3a7813c70b37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZXllYnJvd3x8fHx8fDE3MDU2NTY0ODE&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080" },
    { type: "lips", src: "https://images.unsplash.com/photo-1596236100220-9a18fc7d6480?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bGlwc3x8fHx8fDE3MDU2NTY0ODI&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080" },
    { type: "nose", src: "https://images.unsplash.com/photo-1576803331191-66451fd6a679?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8bm9zZXx8fHx8fDE3MDU2NTY0ODM&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080" },
    { type: "face", src: "https://images.unsplash.com/photo-1616093098059-f91fd5b30926?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZmFjZXN0cnVjdHVyZXx8fHx8fDE3MDU2NTY0ODQ&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080" },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Human Body Sketch Board</h1>
        <div className="flex flex-wrap gap-4 mb-4">
          {bodyParts.map((part) => (
            <BodyPart key={part.type} {...part} />
          ))}
        </div>
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => {/* Implement undo logic */}}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
            aria-label="Undo"
          >
            <MdUndo className="mr-2" /> Undo
          </button>
          <button
            onClick={() => {/* Implement color customization */}}
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
            aria-label="Customize colors"
          >
            <MdColorLens className="mr-2" /> Customize Colors
          </button>
        </div>
        <SketchBoard />
      </div>
    </DndProvider>
  );
};

export default SketchingBoardComponent;