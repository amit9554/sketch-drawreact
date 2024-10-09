import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Grid, Box, Paper, Typography, Button } from "@mui/material";
import { Rnd } from "react-rnd";

// Constants for item types
const ItemTypes = {
    BODY_PART: "body_part",
};

// PNG images for body parts
const bodyParts = [
    { id: 1, name: "Eye", image: require("./assets/images/eyes/01.png") },
    { id: 2, name: "Eyebrow", image: require("./assets/images/eyebrows/01.png") },
    { id: 3, name: "Hair", image: require("./assets/images/hair/01.png") },
    { id: 4, name: "Head", image: require("./assets/images/head/01.png") },
    { id: 5, name: "Lips", image: require("./assets/images/lips/01.png") },
    { id: 6, name: "Nose", image: require("./assets/images/nose/01.png") },
];

// Draggable component for body parts
function DraggablePart({ part }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.BODY_PART,
        item: { part },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <Paper
            ref={drag}
            elevation={3}
            sx={{
                padding: 2,
                opacity: isDragging ? 0.5 : 1,
                cursor: "move",
                textAlign: "center",
            }}
        >
            <Typography variant="h6">{part.name}</Typography>
            {/* Display PNG Image */}
            <img
                src={part.image}
                alt={part.name}
                style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                }}
            />
        </Paper>
    );
}

// Drop area component
function DropZone({ onDrop, children }) {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.BODY_PART,
        drop: (item) => onDrop(item.part),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <Box
            ref={drop}
            sx={{
                width: "100%",
                height: 700, // Increased height
                border: "2px dashed gray",
                backgroundColor: isOver ? "lightyellow" : "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
            }}
        >
            {children}
        </Box>
    );
}

// Main SketchingBoard Component
export default function SketchingBoard() {
    const [placedParts, setPlacedParts] = useState([]);
    const [selectedPartIndex, setSelectedPartIndex] = useState(null); // For selected part
    const handleDrop = (part) => {
        setPlacedParts((prevParts) => [
            ...prevParts,
            { ...part, width: 80, height: 80, x: 50, y: 50 },
        ]);
    };

    const handleResizeOrDrag = (index, newPosition) => {
        const newParts = [...placedParts];
        newParts[index] = {
            ...newParts[index],
            ...newPosition,
        };
        setPlacedParts(newParts);
    };

    const handleRemovePart = () => {
        if (selectedPartIndex !== null) {
            setPlacedParts((prevParts) =>
                prevParts.filter((_, i) => i !== selectedPartIndex)
            );
            setSelectedPartIndex(null); // Clear selection
        }
    };

    const handleRemoveAll = () => {
        setPlacedParts([]);
        setSelectedPartIndex(null); // Clear selection
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <Grid container spacing={2}>
                {/* Left Panel: Body Parts */}
                <Grid item xs={4}>
                    <Typography variant="h5" gutterBottom>
                        Body Parts
                    </Typography>
                    <Grid container spacing={2}>
                        {bodyParts.map((part) => (
                            <Grid item xs={6} key={part.id}>
                                <DraggablePart part={part} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                {/* Right Panel: Sketch Board */}
                <Grid item xs={8}>
                    <Typography variant="h5" gutterBottom>
                        Sketching Board
                    </Typography>

                    {/* Control Buttons */}
                    <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleRemoveAll}
                        >
                            Remove All
                        </Button>

                        {selectedPartIndex !== null && (
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleRemovePart}
                            >
                                Delete
                            </Button>
                        )}
                    </Box>

                    <DropZone onDrop={handleDrop}>
                        {/* Render Placed Parts */}
                        {placedParts.map((part, index) => (
                            <Rnd
                                key={index}
                                bounds="parent"
                                size={{ width: part.width, height: part.height }}
                                position={{ x: part.x, y: part.y }}
                                onDragStop={(e, d) =>
                                    handleResizeOrDrag(index, { x: d.x, y: d.y })
                                }
                                onResizeStop={(
                                    e,
                                    direction,
                                    ref,
                                    delta,
                                    position
                                ) => {
                                    handleResizeOrDrag(index, {
                                        width: ref.style.width,
                                        height: ref.style.height,
                                        ...position,
                                    });
                                }}
                                onClick={() => setSelectedPartIndex(index)}
                                style={{
                                    border: selectedPartIndex === index ? "2px solid blue" : "none",
                                }}
                                resizeHandleStyles={
                                    selectedPartIndex === index
                                        ? {
                                              topLeft: {
                                                  width: "5px",
                                                  height: "5px",
                                                  backgroundColor: "black",
                                                  border: "2px solid white",
                                                  cursor: "nw-resize",
                                              },
                                              topRight: {
                                                  width: "5px",
                                                  height: "5px",
                                                  backgroundColor: "black",
                                                  border: "2px solid white",
                                                  cursor: "ne-resize",
                                              },
                                              bottomLeft: {
                                                  width: "5px",
                                                  height: "5px",
                                                  backgroundColor: "black",
                                                  border: "2px solid white",
                                                  cursor: "sw-resize",
                                              },
                                              bottomRight: {
                                                  width: "5px",
                                                  height: "5px",
                                                  backgroundColor: "black",
                                                  border: "2px solid white",
                                                  cursor: "se-resize",
                                              },
                                          }
                                        : {}
                                } // Only show resize handles on the selected part
                            >
                                <img
                                    src={part.image}
                                    alt={part.name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                    }}
                                />
                            </Rnd>
                        ))}
                    </DropZone>
                </Grid>
            </Grid>
        </DndProvider>
    );
}
