import React, { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Grid, Box, Paper, Typography, Button } from "@mui/material";
import { Rnd } from "react-rnd";

// Constants for item types
const ItemTypes = {
    BODY_PART: "body_part",
};

// PNG images for body parts
const bodyParts = {
    eyes: [
        { id: 1, name: "Eye 1", image: require("./assets/images/eyes/01.png") },
        { id: 2, name: "Eye 2", image: require("./assets/images/eyes/02.png") },
        { id: 3, name: "Eye 3", image: require("./assets/images/eyes/03.png") },
        { id: 4, name: "Eye 4", image: require("./assets/images/eyes/04.png") },
    ],
    nose: [
        { id: 1, name: "Nose 1", image: require("./assets/images/nose/01.png") },
        { id: 2, name: "Nose 2", image: require("./assets/images/nose/02.png") },
        { id: 3, name: "Nose 3", image: require("./assets/images/nose/03.png") },
        { id: 4, name: "Nose 4", image: require("./assets/images/nose/04.png") },
    ],
};

// Draggable component for body parts
function DraggablePart({ part, type }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.BODY_PART,
        item: { part, type },
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
                    width: "50px",
                    height: "50px",
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
        drop: (item, monitor) => onDrop(item.part, item.type, monitor),
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
    const [selectedPartIndex, setSelectedPartIndex] = useState(null);
    const [selectedStepIndex, setSelectedStepIndex] = useState(null);
    const [stepImages, setStepImages] = useState([]);
    const canvasRef = useRef(null);

    const [selectedBodyPart, setSelectedBodyPart] = useState('eyes');

    const handleDrop = (part, type, monitor) => {
        exportImage();
        const dropZone = document.getElementById("drop-zone");
        const dropZoneRect = dropZone.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();

        const x = clientOffset.x - dropZoneRect.left;
        const y = clientOffset.y - dropZoneRect.top;

        setPlacedParts((prevParts) => [
            ...prevParts,
            { ...part, width: 80, height: 80, x, y, locked: false, type },
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

    const drawFinalProduct = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        placedParts.forEach((part) => {
            const img = new Image();
            img.src = part.image;
            img.onload = () => {
                ctx.drawImage(img, part.x, part.y, part.width, part.height);
            };
        });
    };

    useEffect(() => {
        drawFinalProduct();
    }, [placedParts]);

    const handleRemovePart = () => {
        if (selectedPartIndex !== null) {
            setPlacedParts((prevParts) =>
                prevParts.filter((_, i) => i !== selectedPartIndex)
            );
            setSelectedPartIndex(null);
            setSelectedStepIndex(null);
        }
    };

    const handleRemoveAll = () => {
        setPlacedParts([]);
        setSelectedPartIndex(null);
        setSelectedStepIndex(null);
        setSelectedBodyPart('eyes');
    };

    const handleClickOutside = () => {
        setSelectedPartIndex(null);
        setSelectedStepIndex(null);
    };

    const handleLockToggle = () => {
        if (selectedPartIndex !== null) {
            const newParts = [...placedParts];
            newParts[selectedPartIndex].locked = !newParts[selectedPartIndex].locked;
            setPlacedParts(newParts);
        }
    };

    const handleJumpToPart = (index) => {
        setSelectedPartIndex(index);
    };

    const handleJumpToStep = (index) => {
        setSelectedStepIndex(index);
    };

    const exportImage = () => {
        const canvas = canvasRef.current;
        const imageURL = canvas.toDataURL();
        setStepImages((prevImages) => [...prevImages, imageURL]);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedPartIndex !== null) {
                const newParts = [...placedParts];
                const selectedPart = newParts[selectedPartIndex];
                const moveAmount = 5;
                const resizeAmount = 10;

                if (e.ctrlKey) {
                    switch (e.key) {
                        case "+":
                            selectedPart.width += resizeAmount;
                            selectedPart.height += resizeAmount;
                            break;
                        case "-":
                            if (selectedPart.width > resizeAmount && selectedPart.height > resizeAmount) {
                                selectedPart.width -= resizeAmount;
                                selectedPart.height -= resizeAmount;
                            }
                            break;
                        default:
                            return;
                    }
                    setPlacedParts(newParts);
                    e.preventDefault();
                } else {
                    switch (e.key) {
                        case "ArrowUp":
                            selectedPart.y -= moveAmount;
                            break;
                        case "ArrowDown":
                            selectedPart.y += moveAmount;
                            break;
                        case "ArrowLeft":
                            selectedPart.x -= moveAmount;
                            break;
                        case "ArrowRight":
                            selectedPart.x += moveAmount;
                            break;
                        default:
                            return;
                    }

                    setPlacedParts(newParts);
                    e.preventDefault();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedPartIndex, placedParts]);

    return (
        <DndProvider backend={HTML5Backend}>
            <Grid container spacing={1}>
                <Grid item sm={1}>
                    <Typography variant="h5" gutterBottom>
                        Sidebar
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Button
                            variant="contained"
                            color={selectedBodyPart === 'eyes' ? "primary" : "default"}
                            onClick={() => setSelectedBodyPart('eyes')}
                        >
                            Eye
                        </Button>
                        <Button
                            variant="contained"
                            color={selectedBodyPart === 'nose' ? "primary" : "default"}
                            onClick={() => setSelectedBodyPart('nose')}
                        >
                            Nose
                        </Button>
                    </Box>
                </Grid>
                <Grid item sm={1}>
                    <Typography variant="h5" gutterBottom>
                        Body Parts
                    </Typography>
                    <Grid container spacing={2}>
                        {bodyParts[selectedBodyPart].map((part) => (
                            <Grid item xs={12} key={part.id}>
                                <DraggablePart part={part} type={selectedBodyPart} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
                <Grid item xs={8}>
                    <Typography variant="h5" gutterBottom>
                        Sketching Board
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, marginBottom: 2 }}>
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
                                    e.stopPropagation();
                                    setSelectedPartIndex(index);
                                }}
                                style={{
                                    border: selectedPartIndex === index ? "2px solid blue" : "none",
                                }}
                                disableDragging={part.locked}
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
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={700}
                        style={{ border: "1px solid black", display: "none" }}
                    />
                </Grid>
                <Grid item xs={1}>
                    <Typography variant="h6">Steps</Typography>
                    <Box>
                        {stepImages.map((imageSrc, index) => (
                            <Button
                                key={index}
                                variant="outlined"
                                onClick={() => handleJumpToStep(index)}
                                sx={{
                                    display: "block",
                                    margin: "5px 0",
                                    width: "100%",
                                    textAlign: "left",
                                    backgroundColor: selectedStepIndex === index ? "lightblue" : "white",
                                    "&:hover": {
                                        backgroundColor: selectedStepIndex === index ? "lightblue" : "#f0f0f0",
                                    },
                                }}
                            >
                                <img
                                    src={imageSrc}
                                    alt={`Step ${index + 1}`}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                    }}
                                />
                            </Button>
                        ))}
                    </Box>
                </Grid>
                <Grid item xs={1}>
                    <Typography variant="h6">Parts</Typography>
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
                                        backgroundColor: selectedPartIndex === index ? "lightblue" : "#f0f0f0",
                                    },
                                }}
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
                            </Button>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </DndProvider>
    );
}