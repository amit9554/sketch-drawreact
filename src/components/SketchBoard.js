import React, { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Grid, Box, Paper, Typography, Button, Tooltip, IconButton, Slider, AppBar, Toolbar } from "@mui/material";
import { Rnd } from "react-rnd";
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CancelIcon from '@mui/icons-material/Cancel';
import CreateIcon from '@mui/icons-material/Create';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import EraserIcon from '@mui/icons-material/AutoFixNormal';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

// Constants for item types
const ItemTypes = {
    BODY_PART: "body_part",
};

const partIcons = {
    head: require('./assets/images/head/01.png'),
    hair: require('./assets/icons/hair.png'),
    nose: require('./assets/icons/nose.png'),
    eyes: require('./assets/icons/eye.png'),
    eyebrows: require('./assets/icons/eyebrows.png'),
    lips: require('./assets/icons/lips.png'),
    ear: require('./assets/icons/ear.png'),
    neck: require('./assets/icons/neck.png'),
    mustach: require('./assets/icons/mustach.png'),


};

const bodyParts1 = {
    head: Array.from({ length: 20 }, (_, index) => ({
        id: index + 1,
        image: require(`./assets/images/head/${String(index + 1).padStart(2, '0')}.png`),
    })),
    hair: Array.from({ length: 24 }, (_, index) => ({
        id: index + 21,
        image: require(`./assets/images/hair/${String(index + 1).padStart(2, '0')}.png`),
    })),
    nose: Array.from({ length: 24 }, (_, index) => ({
        id: index + 45,
        image: require(`./assets/images/nose/${String(index + 1).padStart(2, '0')}.png`),
    })),
    eyes: Array.from({ length: 24 }, (_, index) => ({
        id: index + 69,
        image: require(`./assets/images/eyes/${String(index + 1).padStart(2, '0')}.png`),
    })),
    eyebrows: Array.from({ length: 24 }, (_, index) => ({
        id: index + 93,
        image: require(`./assets/images/eyebrows/${String(index + 1).padStart(2, '0')}.png`),
    })),
    lips: Array.from({ length: 24 }, (_, index) => ({
        id: index + 117,
        image: require(`./assets/images/lips/${String(index + 1).padStart(2, '0')}.png`),
    })),
    ear: Array.from({ length: 8 }, (_, index) => ({
        id: index + 141,
        image: require(`./assets/images/ear/${String(index + 1).padStart(2, '0')}.png`),
    })),
    neck: Array.from({ length: 4 }, (_, index) => ({
        id: index + 153,
        image: require(`./assets/images/neck/${String(index + 1).padStart(2, '0')}.png`),
    })),
    mustach: Array.from({ length: 24 }, (_, index) => ({
        id: index + 157,
        image: require(`./assets/images/mustach/${String(index + 1).padStart(2, '0')}.png`),
    })),
};

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
                height: 600,
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
    const [selectedkey, setSelectedKey] = useState(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const boxRef = useRef(null);

    const [selectedStepIndex, setSelectedStepIndex] = useState(null);
    const [displayedBodyParts, setDisplayedBodyParts] = useState([]);
    const [stepImages, setStepImages] = useState([]);
    const canvasRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [isPencilActive, setIsPencilActive] = useState(false);
    const [pencilColor, setPencilColor] = useState("#000000");
    const drawingCanvasRef = useRef(null);

    const [pencilWidth, setPencilWidth] = useState(2);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const [isErasing, setIsErasing] = useState(false);
    const [eraserWidth, setEraserWidth] = useState(10);
    const [selectedTool, setSelectedTool] = useState(null);
    useEffect(() => {
        const updateCanvasSize = () => {
            if (boxRef.current) {
                const { width, height } = boxRef.current.getBoundingClientRect();
                setCanvasSize({ width, height });
            }
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        return () => window.removeEventListener('resize', updateCanvasSize);
    }, []);

    const handleDrop = (part, monitor) => {
        exportImage();
        const dropZone = document.getElementById("drop-zone");
        const dropZoneRect = dropZone.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();

        const x = Math.min(Math.max(clientOffset.x - dropZoneRect.left, 0), canvasSize.width - 70);
        const y = Math.min(Math.max(clientOffset.y - dropZoneRect.top, 0), canvasSize.height - 70);

        setPlacedParts((prevParts) => [
            ...prevParts,
            { ...part, width: 70, height: 70, x, y, locked: false },
        ]);
    };
    const handleEraserToggle = () => {
        setIsErasing(!isErasing);
        setIsPencilActive(false);
    };

    const handleEraserWidthChange = (_event, newValue) => {
        setEraserWidth(newValue);
    };

    const erase = ({ nativeEvent }) => {
        if (!isErasing) return;
        const { offsetX, offsetY } = nativeEvent;
        const ctx = drawingCanvasRef.current.getContext("2d");
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(offsetX, offsetY, eraserWidth / 2, 0, Math.PI * 2, false);
        ctx.fill();
    };

    const startErasing = ({ nativeEvent }) => {
        if (!isErasing) return;
        setIsDrawing(true);
        erase({ nativeEvent });
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const ctx = drawingCanvasRef.current.getContext("2d");
        const { offsetX, offsetY } = nativeEvent;

        if (isPencilActive) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
        } else if (isErasing) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(offsetX, offsetY, eraserWidth / 2, 0, Math.PI * 2, false);
            ctx.fill();
        }
    };

    const saveToHistory = () => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
            placedParts: [...placedParts],
            drawingImage: drawingCanvasRef.current.toDataURL(),
        });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            const previousState = history[historyIndex - 1];
            setPlacedParts(previousState.placedParts);
            loadDrawingFromDataURL(previousState.drawingImage);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            const nextState = history[historyIndex + 1];
            setPlacedParts(nextState.placedParts);
            loadDrawingFromDataURL(nextState.drawingImage);
        }
    };

    const loadDrawingFromDataURL = (dataURL) => {
        const img = new Image();
        img.onload = () => {
            const ctx = drawingCanvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = dataURL;
    };

    const startDrawing = ({ nativeEvent }) => {
        if (isPencilActive) {
            const { offsetX, offsetY } = nativeEvent;
            const ctx = drawingCanvasRef.current.getContext("2d");
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
            setIsDrawing(true);
        } else if (isErasing) {
            startErasing({ nativeEvent });
        }
    };

    const stopDrawing = () => {
        if (isDrawing) {
            if (isPencilActive) {
                const ctx = drawingCanvasRef.current.getContext("2d");
                ctx.closePath();
            }
            setIsDrawing(false);
            saveToHistory();
        }
    };

    const handlePencilWidthChange = (_event, newValue) => {
        setPencilWidth(newValue);
        const ctx = drawingCanvasRef.current.getContext("2d");
        ctx.lineWidth = newValue;
    };

    const handleColorChange = (event) => {
        setPencilColor(event.target.value);
        const ctx = drawingCanvasRef.current.getContext("2d");
        ctx.strokeStyle = event.target.value;
    };

    useEffect(() => {
        if (drawingCanvasRef.current) {
            const ctx = drawingCanvasRef.current.getContext("2d");
            ctx.lineWidth = pencilWidth;
            ctx.strokeStyle = pencilColor;
            ctx.lineCap = "round";
        }
    }, [pencilColor, pencilWidth]);
    // Modify the exportImage function to include the drawing layer
    const exportImage = () => {
        const canvas = canvasRef.current;
        const imageURL = canvas.toDataURL();
        setStepImages((prevImages) => [...prevImages, imageURL]);
    };

    const handleResizeOrDrag = (index, newPosition) => {
        const newParts = [...placedParts];
        const part = newParts[index];

        const x = Math.min(Math.max(newPosition.x, 0), canvasSize.width - part.width);
        const y = Math.min(Math.max(newPosition.y, 0), canvasSize.height - part.height);

        newParts[index] = {
            ...part,
            x,
            y,
            width: Math.min(newPosition.width, canvasSize.width - x),
            height: Math.min(newPosition.height, canvasSize.height - y),
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
        clearDrawing();
        saveToHistory();
    };

    const clearDrawing = () => {
        const ctx = drawingCanvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
        saveToHistory();
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




    const handleJumpToStep = (index, imageSrc) => {
        setSelectedStepIndex(index);

        // Find the exact part from the stepImages array
        const canvas = canvasRef.current;
        const savedPart = stepImages[index];

        if (savedPart) {
            const newPart = {
                id: `step_${index}`,
                name: `Step ${index + 1}`,
                image: imageSrc,
                width: savedPart.width,  // Restore the exact width
                height: savedPart.height, // Restore the exact height
                x: savedPart.x,           // Restore the exact x position
                y: savedPart.y,           // Restore the exact y position
                locked: savedPart.locked,  // Restore if the image was locked
            };

            setPlacedParts([newPart]); // Set the restored image on the canvas
            setStepImages((prevImages) => prevImages.slice(0, index + 1)); // Keep history up to this step
        }
    };



    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedPartIndex !== null) {
                const newParts = [...placedParts];
                const selectedPart = newParts[selectedPartIndex];
                const moveAmount = 5; // Amount to move the image by
                const resizeAmount = 10; // Amount to resize by

                if (e.ctrlKey) {
                    switch (e.key) {
                        case "+":
                            // Increase size
                            selectedPart.width += resizeAmount;
                            selectedPart.height += resizeAmount;
                            break;
                        case "-":
                            // Decrease size, ensure it doesn't go below a minimum size
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
                    // Move with arrow keys
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




    const handleShowBodyParts = (key) => {
        setSelectedKey(key)

        setDisplayedBodyParts(bodyParts1[key]);
    };

    // Function to move selected part backward (behind another image)
    const handleMoveToBack = () => {
        if (selectedPartIndex !== null && selectedPartIndex > 0) {
            const newParts = [...placedParts];
            const selectedPart = newParts.splice(selectedPartIndex, 1)[0]; // Remove the selected part
            newParts.unshift(selectedPart); // Add the part to the beginning (back of the stack)
            setPlacedParts(newParts);
            setSelectedPartIndex(0); // Set the index to 0 as it's now at the back
        }
    };

    // Function to move selected part forward (in front of other images)
    const handleMoveToFront = () => {
        if (selectedPartIndex !== null && selectedPartIndex < placedParts.length - 1) {
            const newParts = [...placedParts];
            const selectedPart = newParts.splice(selectedPartIndex, 1)[0]; // Remove the selected part
            newParts.push(selectedPart); // Add the part to the end (front of the stack)
            setPlacedParts(newParts);
            setSelectedPartIndex(newParts.length - 1); // Set the index to the last position
        }
    };


    return (
        <DndProvider backend={HTML5Backend}>
            <Grid container spacing={2}>
                <Grid item sx={{ padding: '10px' }}>
                    {Object.keys(bodyParts1).map((key) => (
                        <Grid
                            container
                            spacing={2}
                            key={key}
                            sx={{ maxHeight: 650, overflowY: 'auto' }}
                            margin={1}
                        >
                            <Tooltip title={key.charAt(0).toUpperCase() + key.slice(1)} arrow placement="right">
                                <Button
                                    variant="contained"
                                    // color="primary"
                                    onClick={() => handleShowBodyParts(key)}
                                    // sx={{ padding: 1 }}
                                    style={{
                                        backgroundColor:
                                            selectedkey === key ? "#c9c9c9" : "#b7f6f7",

                                    }}
                                >
                                    <img
                                        src={partIcons[key]}
                                        alt={`${key} icon`}
                                        style={{ width: '30px', height: '35px' }}
                                    />
                                </Button>
                            </Tooltip>
                        </Grid>
                    ))}
                </Grid>
                <Grid item xs={1}>
                    {/* <Typography variant="h6" marginBottom={8}>
                        Body Parts
                    </Typography> */}
                    <Grid
                        container
                        spacing={2}
                        sx={{
                            maxHeight: 650,
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {
                                width: 0,
                            },
                            scrollbarWidth: "none",
                        }}
                    >
                        {displayedBodyParts.map((part) => (
                            <Grid item key={part.id} xs={12}>
                                <DraggablePart part={part} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
                <Grid item xs={9}>
                    {/* <Typography variant="h5" gutterBottom>
                        Sketching Board
                    </Typography> */}
                    <>
                        <AppBar position="static" sx={{ backgroundColor: "#c9c9c9" }} >
                            <Toolbar sx={{ display: "flex", gap: 2 }}>
                                <Tooltip title="Clear All">
                                    <IconButton
                                        color={selectedTool === "clear" ? "success" : "inherit"}
                                        onClick={() => {
                                            setSelectedTool("clear");
                                            handleRemoveAll();
                                        }}
                                        sx={{
                                            backgroundColor: selectedTool === "clear" ? "#0843a1" : "inherit",
                                            color: selectedTool === "clear" ? "white" : "inherit", // Change icon color to white when selected
                                        }}
                                    >
                                        <CancelIcon sx={{ color: selectedTool === "clear" ? "white" : "inherit" }} />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Undo">
                                    <IconButton
                                        color={selectedTool === "undo" ? "success" : "inherit"}
                                        onClick={() => {
                                            setSelectedTool("undo");
                                            undo();
                                        }}
                                        disabled={historyIndex <= 0}
                                        sx={{
                                            backgroundColor: selectedTool === "undo" ? "#0843a1" : "inherit",
                                            color: selectedTool === "undo" ? "white" : "inherit", // Change icon color to white when selected
                                        }}
                                    >
                                        <UndoIcon sx={{ color: selectedTool === "undo" ? "white" : "inherit" }} />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Redo">
                                    <IconButton
                                        color={selectedTool === "redo" ? "success" : "inherit"}
                                        onClick={() => {
                                            setSelectedTool("redo");
                                            redo();
                                        }}
                                        disabled={historyIndex >= history.length - 1}
                                        sx={{
                                            backgroundColor: selectedTool === "redo" ? "#0843a1" : "inherit",
                                            color: selectedTool === "redo" ? "white" : "inherit", // Change icon color to white when selected
                                        }}
                                    >
                                        <RedoIcon sx={{ color: selectedTool === "redo" ? "white" : "inherit" }} />
                                    </IconButton>
                                </Tooltip>

                                {selectedPartIndex !== null && (
                                    <>
                                        <Tooltip title={placedParts[selectedPartIndex]?.locked ? "Unlock" : "Lock"}>
                                            <IconButton
                                                color={selectedTool === "lock" ? "success" : "inherit"}
                                                onClick={() => {
                                                    setSelectedTool("lock");
                                                    handleLockToggle();
                                                }}
                                                sx={{
                                                    backgroundColor: selectedTool === "lock" ? "#0843a1" : "inherit",
                                                    color: selectedTool === "lock" ? "white" : "inherit", // Change icon color to white when selected
                                                }}
                                            >
                                                {placedParts[selectedPartIndex]?.locked ? (
                                                    <LockIcon sx={{ color: selectedTool === "lock" ? "white" : "inherit" }} />
                                                ) : (
                                                    <LockOpenIcon sx={{ color: selectedTool === "lock" ? "white" : "inherit" }} />
                                                )}
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Remove">
                                            <IconButton
                                                color={selectedTool === "remove" ? "success" : "inherit"}
                                                onClick={() => {
                                                    setSelectedTool("remove");
                                                    handleRemovePart();
                                                }}
                                                sx={{
                                                    backgroundColor: selectedTool === "remove" ? "#0843a1" : "inherit",
                                                    color: selectedTool === "remove" ? "white" : "inherit", // Change icon color to white when selected
                                                }}
                                            >
                                                <DeleteIcon sx={{ color: selectedTool === "remove" ? "white" : "inherit" }} />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Move to Front">
                                            <IconButton
                                                onClick={handleMoveToFront}
                                                disabled={selectedPartIndex >= placedParts.length - 1}
                                                sx={{
                                                    backgroundColor: selectedTool === "front" ? "#0843a1" : "inherit",
                                                    color: selectedTool === "front" ? "white" : "inherit",
                                                }}
                                            >
                                                <ArrowUpwardIcon sx={{ color: selectedTool === "front" ? "white" : "inherit" }} />
                                            </IconButton>
                                        </Tooltip>

                                        {/* Move to Back Button */}
                                        <Tooltip title="Move to Back">
                                            <IconButton
                                                onClick={handleMoveToBack}
                                                disabled={selectedPartIndex <= 0}
                                                sx={{
                                                    backgroundColor: selectedTool === "back" ? "#0843a1" : "inherit",
                                                    color: selectedTool === "back" ? "white" : "inherit",
                                                }}
                                            >
                                                <ArrowDownwardIcon sx={{ color: selectedTool === "back" ? "white" : "inherit" }} />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}

                                <Tooltip title={isPencilActive ? "Deactivate Pencil" : "Activate Pencil"}>
                                    <IconButton
                                        color={selectedTool === "pencil" ? "success" : "inherit"}
                                        onClick={() => {
                                            setSelectedTool("pencil");
                                            setIsPencilActive(!isPencilActive);
                                            setIsErasing(false);
                                        }}
                                        sx={{
                                            backgroundColor: selectedTool === "pencil" ? "#0843a1" : "inherit",
                                            color: selectedTool === "pencil" ? "white" : "inherit", // Change icon color to white when selected
                                        }}
                                    >
                                        <CreateIcon sx={{ color: selectedTool === "pencil" ? "white" : "inherit" }} />
                                    </IconButton>
                                </Tooltip>

                                {isPencilActive && (
                                    <>
                                        <Tooltip title="Choose Pencil Color">
                                            <IconButton color="inherit">
                                                <ColorLensIcon />
                                                <input
                                                    type="color"
                                                    value={pencilColor}
                                                    onChange={handleColorChange}
                                                    style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%' }}
                                                />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Adjust Pencil Width">
                                            <Slider
                                                value={pencilWidth}
                                                onChange={handlePencilWidthChange}
                                                aria-labelledby="pencil-width-slider"
                                                min={1}
                                                max={20}
                                                sx={{ width: 100, color: 'white' }}
                                            />
                                        </Tooltip>
                                    </>
                                )}

                                <Tooltip title={isErasing ? "Deactivate Eraser" : "Activate Eraser"}>
                                    <IconButton
                                        color={selectedTool === "eraser" ? "success" : "inherit"}
                                        onClick={() => {
                                            setSelectedTool("eraser");
                                            handleEraserToggle();
                                        }}
                                        sx={{
                                            backgroundColor: selectedTool === "eraser" ? "#0843a1" : "inherit",
                                            color: selectedTool === "eraser" ? "white" : "inherit", // Change icon color to white when selected
                                        }}
                                    >
                                        <EraserIcon sx={{ color: selectedTool === "eraser" ? "white" : "inherit" }} />
                                    </IconButton>
                                </Tooltip>

                                {isErasing && (
                                    <Tooltip title="Adjust Eraser Width">
                                        <Slider
                                            value={eraserWidth}
                                            onChange={handleEraserWidthChange}
                                            aria-labelledby="eraser-width-slider"
                                            min={5}
                                            max={50}
                                            sx={{ width: 100, color: 'white' }}
                                        />
                                    </Tooltip>
                                )}
                            </Toolbar>
                        </AppBar>
                    </>


                    <DropZone onDrop={handleDrop} onClick={handleClickOutside}>
                        <Box
                            ref={boxRef}
                            sx={{
                                position: 'relative',
                                width: '100%',
                                height: '600px',
                                margin: 'auto',
                            }}
                        >
                            {placedParts.map((part, index) => (
                                <Rnd
                                    key={index}
                                    bounds="parent"
                                    size={{ width: part.width, height: part.height }}
                                    position={{ x: part.x, y: part.y }}
                                    onDragStop={(_e, d) => {
                                        if (!part.locked) {
                                            handleResizeOrDrag(index, { x: d.x, y: d.y, width: part.width, height: part.height });
                                        }
                                    }}
                                    onResizeStop={(_e, _direction, ref, _delta, position) => {
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
                            <canvas
                                ref={drawingCanvasRef}
                                width={canvasSize.width}
                                height={canvasSize.height}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    zIndex: 1000,
                                    pointerEvents: isPencilActive || isErasing ? 'auto' : 'none',
                                    cursor: isErasing ? 'crosshair' : 'default',
                                }}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseOut={stopDrawing}
                            />
                        </Box>
                    </DropZone>
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        style={{ border: "1px solid black", display: "none" }}
                    />
                </Grid>
                {/* <Grid item xs={1}> */}
                {/* <Typography variant="h6" marginBottom={2}>
                        Steps
                    </Typography> */}
                {/* <Box
                        sx={{
                            maxHeight: 650,
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {
                                width: 0,
                            },
                            scrollbarWidth: "none",
                        }}
                    >
                        {stepImages.map((imageSrc, index) => (
                            <Button
                                key={index}
                                variant="outlined"
                                onClick={() => handleJumpToStep(index, imageSrc)}
                                sx={{
                                    display: "block",
                                    margin: "5px 0",
                                    width: "100%",
                                    textAlign: "left",
                                    backgroundColor:
                                        selectedStepIndex === index ? "lightblue" : "white",
                                    "&:hover": {
                                        backgroundColor:
                                            selectedStepIndex === index ? "lightblue" : "#f0f0f0",
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
                    </Box> */}
                {/* </Grid> */}
                <Grid item xs={1}>
                    {/* <Typography variant="h6" marginBottom={8}>
                        Parts
                    </Typography> */}
                    <Box
                        sx={{
                            maxHeight: 650,
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {
                                width: 0,
                            },
                            scrollbarWidth: "none",
                        }}
                    >
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
                                    backgroundColor:
                                        selectedPartIndex === index ? "lightblue" : "white",
                                    "&:hover": {
                                        backgroundColor:
                                            selectedPartIndex === index ? "lightblue" : "#f0f0f0",
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
