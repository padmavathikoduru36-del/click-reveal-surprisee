// Configuration
const CUSTOM_MESSAGE = "You make everything bloom";
const WATER_THRESHOLD = 100;

// State
let waterLevel = 0;
let isWatering = false;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// DOM Elements
const wateringCan = document.getElementById('wateringCan');
const pot = document.getElementById('pot');
const flowers = document.querySelectorAll('.flower');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const messageContainer = document.getElementById('messageContainer');
const messageTitle = document.getElementById('messageTitle');
const waterDropsContainer = document.getElementById('waterDrops');
const sparklesContainer = document.getElementById('sparkles');
const floatingHeartsContainer = document.getElementById('floatingHearts');
const fallingPetalsContainer = document.getElementById('fallingPetals');

// Initialize
function init() {
  createFloatingHearts();
  createFallingPetals();
  setupWateringCan();
  messageTitle.textContent = CUSTOM_MESSAGE;
}

// Create floating hearts
function createFloatingHearts() {
  const hearts = ['#ff6b9d', '#ff8fab', '#ffc2d1', '#ff69b4', '#ff1493'];
  
  for (let i = 0; i < 15; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '&#10084;';
    heart.style.left = Math.random() * 100 + '%';
    heart.style.color = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.fontSize = (15 + Math.random() * 15) + 'px';
    heart.style.animationDelay = (Math.random() * 8) + 's';
    heart.style.animationDuration = (6 + Math.random() * 4) + 's';
    floatingHeartsContainer.appendChild(heart);
  }
}

// Create falling petals
function createFallingPetals() {
  for (let i = 0; i < 20; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal-fall';
    petal.style.left = Math.random() * 100 + '%';
    petal.style.animationDelay = (Math.random() * 10) + 's';
    petal.style.animationDuration = (8 + Math.random() * 4) + 's';
    petal.style.width = (8 + Math.random() * 8) + 'px';
    petal.style.height = (8 + Math.random() * 8) + 'px';
    fallingPetalsContainer.appendChild(petal);
  }
}

// Setup watering can drag functionality
function setupWateringCan() {
  // Mouse events
  wateringCan.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
  
  // Touch events
  wateringCan.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('touchend', endDrag);
}

function getEventPosition(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

function startDrag(e) {
  e.preventDefault();
  isDragging = true;
  wateringCan.classList.add('dragging');
  
  const pos = getEventPosition(e);
  const rect = wateringCan.getBoundingClientRect();
  
  dragOffset.x = pos.x - rect.left - rect.width / 2;
  dragOffset.y = pos.y - rect.top - rect.height / 2;
}

function drag(e) {
  if (!isDragging) return;
  e.preventDefault();
  
  const pos = getEventPosition(e);
  const x = pos.x - dragOffset.x - wateringCan.offsetWidth / 2;
  const y = pos.y - dragOffset.y - wateringCan.offsetHeight / 2;
  
  wateringCan.style.position = 'fixed';
  wateringCan.style.left = x + 'px';
  wateringCan.style.top = y + 'px';
  wateringCan.style.right = 'auto';
  
  // Check if over pot
  checkWatering(pos);
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  wateringCan.classList.remove('dragging');
  stopWatering();
}

function checkWatering(pos) {
  const potRect = pot.getBoundingClientRect();
  const flowerArea = document.querySelector('.flower-area').getBoundingClientRect();
  
  // Expand the target area to include flowers
  const targetArea = {
    left: flowerArea.left - 50,
    right: flowerArea.right + 50,
    top: flowerArea.top - 50,
    bottom: potRect.bottom + 20
  };
  
  if (
    pos.x >= targetArea.left &&
    pos.x <= targetArea.right &&
    pos.y >= targetArea.top &&
    pos.y <= targetArea.bottom
  ) {
    if (!isWatering) {
      startWatering();
    }
    water();
  } else {
    stopWatering();
  }
}

function startWatering() {
  isWatering = true;
  wateringCan.classList.add('watering');
}

function stopWatering() {
  isWatering = false;
  wateringCan.classList.remove('watering');
}

function water() {
  if (waterLevel >= WATER_THRESHOLD) return;
  
  waterLevel = Math.min(waterLevel + 0.5, WATER_THRESHOLD);
  updateProgress();
  updateFlowers();
  createWaterDrop();
  
  if (Math.random() > 0.7) {
    createSparkle();
  }
  
  if (waterLevel >= WATER_THRESHOLD) {
    showMessage();
  }
}

function updateProgress() {
  const percent = Math.round((waterLevel / WATER_THRESHOLD) * 100);
  progressFill.style.width = percent + '%';
  progressText.textContent = percent + '% bloomed';
}

function updateFlowers() {
  const progress = waterLevel / WATER_THRESHOLD;
  
  flowers.forEach((flower, index) => {
    const flowerProgress = Math.min(1, (progress - index * 0.15) / 0.5);
    
    if (flowerProgress > 0) {
      flower.classList.add('blooming');
      
      const scale = 0.3 + flowerProgress * 0.7;
      const height = index === 1 ? 80 + flowerProgress * 40 : (index === 0 ? 60 : 50) + flowerProgress * 30;
      
      flower.style.setProperty('--scale', scale);
      flower.style.setProperty('--height', height + 'px');
      
      // Show leaves
      const leftLeaf = flower.querySelector('.leaf-left');
      const rightLeaf = flower.querySelector('.leaf-right');
      
      if (flowerProgress > 0.5) {
        const leafScale = (flowerProgress - 0.5) * 2;
        leftLeaf.style.transform = `scale(${leafScale}) rotate(-30deg)`;
        rightLeaf.style.transform = `scale(${leafScale}) rotate(30deg) scaleX(-1)`;
      }
    }
  });
}

function createWaterDrop() {
  const drop = document.createElement('div');
  drop.className = 'water-drop';
  drop.style.left = (30 + Math.random() * 90) + 'px';
  drop.style.animationDuration = (0.5 + Math.random() * 0.3) + 's';
  waterDropsContainer.appendChild(drop);
  
  setTimeout(() => {
    drop.remove();
  }, 1000);
}

function createSparkle() {
  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  sparkle.style.left = (20 + Math.random() * 160) + 'px';
  sparkle.style.top = (20 + Math.random() * 100) + 'px';
  sparklesContainer.appendChild(sparkle);
  
  setTimeout(() => {
    sparkle.remove();
  }, 600);
}

function showMessage() {
  pot.classList.add('glowing');
  
  setTimeout(() => {
    messageContainer.classList.add('visible');
  }, 1000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
