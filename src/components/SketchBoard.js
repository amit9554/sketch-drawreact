import React, { useState, useEffect } from "react";
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
function DropZone({ onDrop, children, onClick }) {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.BODY_PART,
        drop: (item, monitor) => onDrop(item.part, monitor),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <Box
            ref={drop}
            id="drop-zone"
            sx={{
                width: "100%",
                height: 700,
                border: "2px dashed gray",
                backgroundColor: isOver ? "lightyellow" : "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
            }}
            onClick={onClick}
        >
            {children}
        </Box>
    );
}

// Main SketchingBoard Component
export default function SketchingBoard() {
    const [placedParts, setPlacedParts] = useState([]);
    const [selectedPartIndex, setSelectedPartIndex] = useState(null); // For selected part

    const handleDrop = (part, monitor) => {
        const dropZone = document.getElementById("drop-zone");
        const dropZoneRect = dropZone.getBoundingClientRect(); // Get DropZone dimensions
        const clientOffset = monitor.getClientOffset(); // Get mouse position on drop

        // Calculate relative position within the DropZone
        const x = clientOffset.x - dropZoneRect.left;
        const y = clientOffset.y - dropZoneRect.top;

        setPlacedParts((prevParts) => [
            ...prevParts,
            { ...part, width: 80, height: 80, x, y, locked: false }, // Set x, y and initial locked state
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

    // Handle clicking outside an image (DropZone click)
    const handleClickOutside = () => {
        setSelectedPartIndex(null); // Deselect any selected part
    };

    // Toggle lock state
    const handleLockToggle = () => {
        if (selectedPartIndex !== null) {
            const newParts = [...placedParts];
            newParts[selectedPartIndex].locked = !newParts[selectedPartIndex].locked;
            setPlacedParts(newParts);
        }
    };

    // Jump to a specific placed part
    const handleJumpToPart = (index) => {
        setSelectedPartIndex(index);
    };

    // Keyboard arrow key handling
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedPartIndex !== null) {
                const newParts = [...placedParts];
                const moveAmount = 5; // Amount to move per key press
                const resizeAmount = 5; // Amount to resize per key press

                switch (e.key) {
                    case "ArrowUp":
                        newParts[selectedPartIndex].y -= moveAmount;
                        break;
                    case "ArrowDown":
                        newParts[selectedPartIndex].y += moveAmount;
                        break;
                    case "ArrowLeft":
                        newParts[selectedPartIndex].x -= moveAmount;
                        break;
                    case "ArrowRight":
                        newParts[selectedPartIndex].x += moveAmount;
                        break;
                    case "+":
                    case "=":
                        if (e.ctrlKey) {
                            newParts[selectedPartIndex].width += resizeAmount;
                            newParts[selectedPartIndex].height += resizeAmount;
                        }
                        break;
                    case "-":
                        if (e.ctrlKey) {
                            newParts[selectedPartIndex].width -= resizeAmount;
                            newParts[selectedPartIndex].height -= resizeAmount;
                        }
                        break;
                    default:
                        return; // Exit if it's not an arrow key
                }

                setPlacedParts(newParts);
                e.preventDefault(); // Prevent scrolling when arrow keys are pressed
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedPartIndex, placedParts]);


    return (
        <DndProvider backend={HTML5Backend}>
            <Grid container spacing={2}>
                {/* Left Panel: Body Parts */}
                <Grid item xs={2}>
                    <Typography variant="h5" gutterBottom>
                        Body Parts
                    </Typography>
                    <Grid container spacing={3}>
                        {bodyParts.map((part) => (
                            <Grid item xs={12} key={part.id}>
                                <DraggablePart part={part} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                {/* Right Panel: Sketch Board and Steps */}
                <Grid item xs={9}>
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
                            <>
                                <Button
                                    variant="contained"
                                    color={placedParts[selectedPartIndex]?.locked ? "primary" : "default"}
                                    onClick={handleLockToggle}
                                >
                                    {placedParts[selectedPartIndex]?.locked ? "Unlock" : "Lock"}
                                </Button>

                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleRemovePart}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                    </Box>

                    <DropZone onDrop={handleDrop} onClick={handleClickOutside}>
                        {/* Render Placed Parts */}
                        {placedParts.map((part, index) => (
                            <Rnd
                                key={index}
                                bounds="parent"
                                size={{ width: part.width, height: part.height }}
                                position={{ x: part.x, y: part.y }}
                                onDragStop={(e, d) => {
                                    if (!part.locked) {
                                        handleResizeOrDrag(index, { x: d.x, y: d.y });
                                    }
                                }}
                                onResizeStop={(e, direction, ref, delta, position) => {
                                    if (!part.locked) {
                                        handleResizeOrDrag(index, {
                                            width: ref.offsetWidth,
                                            height: ref.offsetHeight,
                                            ...position,
                                        });
                                    }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent click event from propagating to DropZone
                                    setSelectedPartIndex(index); // Set selected part on click
                                }}
                                style={{
                                    border: selectedPartIndex === index ? "2px solid blue" : "none", // Highlight selected part
                                }}
                                disableDragging={part.locked} // Disable dragging if locked
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
                <Grid item xs={1}>
                  <Typography variant="h6">Steps</Typography>
                        <Box>
                            {placedParts.map((part, index) => (
                                <Button
                                    key={index}
                                    variant="outlined"
                                    onClick={() => handleJumpToPart(index)}
                                    sx={{
                                        display: "block",
                                        margin: "5px 0",
                                        width: "100%",
                                        textAlign: "left",
                                        backgroundColor: selectedPartIndex === index ? "lightblue" : "white",
                                        "&:hover": {
                                            backgroundColor: selectedPartIndex === index ? "lightblue" : "#f0f0f0", // Change background color on hover
                                        },
                                    }}
                                >
                                    {part.name}
                                </Button>
                            ))}
                        </Box>
                </Grid>                     
            </Grid>
        </DndProvider>
    );
}