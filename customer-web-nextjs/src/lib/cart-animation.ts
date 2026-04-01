"use client";

/**
 * Fly-to-cart animation utility
 * Animates a ghost element from source to the header cart icon
 */
export const flyToCart = (
  sourceImage: HTMLImageElement | string | null | undefined,
  sourceRect: DOMRect
) => {
  if (typeof window === "undefined") return;

  // Find the cart icon with robust selectors
  const cartIcon = document.getElementById("header-cart-icon") || 
                   document.querySelector(".header-cart-icon") ||
                   document.querySelector("header .lucide-shopping-cart")?.parentElement;
                   
  if (!cartIcon || !sourceRect) return;

  const cartRect = cartIcon.getBoundingClientRect();
  
  // Calculate centers for a more precise "bullseye" target
  const targetX = cartRect.left + cartRect.width / 2;
  const targetY = cartRect.top + cartRect.height / 2;

  // Create a ghost container
  const ghost = document.createElement("div");
  ghost.style.position = "fixed";
  ghost.style.left = "0px";
  ghost.style.top = "0px";
  ghost.style.width = `${sourceRect.width}px`;
  ghost.style.height = `${sourceRect.height}px`;
  ghost.style.zIndex = "10000";
  ghost.style.pointerEvents = "none";
  ghost.style.transition = "all 1s cubic-bezier(0.19, 1, 0.22, 1)";
  ghost.style.borderRadius = "12px";
  ghost.style.overflow = "hidden";
  ghost.style.boxShadow = "0 10px 40px rgba(0,0,0,0.3)";
  ghost.style.backgroundColor = "white";
  ghost.style.transform = `translate(${sourceRect.left}px, ${sourceRect.top}px)`;
  ghost.style.transformOrigin = "center center";
  
  // Add the image content
  if (sourceImage) {
    const innerImg = document.createElement("img");
    if (typeof sourceImage === "string") {
      innerImg.src = sourceImage;
    } else if (sourceImage instanceof HTMLImageElement) {
      innerImg.src = sourceImage.src;
    }
    innerImg.style.width = "100%";
    innerImg.style.height = "100%";
    innerImg.style.objectFit = "cover";
    ghost.appendChild(innerImg);
  } else {
    ghost.style.background = "hsl(var(--primary))";
    ghost.style.opacity = "0.5";
  }

  document.body.appendChild(ghost);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // We want the ghost center to be at targetX, targetY.
      // Ghost top-left should be (targetX - sourceWidth*scale/2, targetY - sourceHeight*scale/2)
      // BUT since we are using scale, it's easier to just translate the center.
      // Since it's fixed 0,0, translate(X, Y) moves the top-left corner.
      // To center a 30x30 ghost: translate(targetX - 15, targetY - 15)
      ghost.style.transform = `translate(${targetX - 15}px, ${targetY - 15}px) scale(0.1) rotate(15deg)`;
      ghost.style.width = "30px";
      ghost.style.height = "30px";
      ghost.style.opacity = "0.2";
      ghost.style.borderRadius = "50%";
    });
  });

  // Clean up and notify cart icon
  setTimeout(() => {
    if (ghost.parentNode) {
      ghost.remove();
    }
    
    // Quick scale feedback on cart icon
    cartIcon.classList.add("scale-125", "duration-200");
    const iconSpan = cartIcon.querySelector("span");
    if (iconSpan) {
      iconSpan.classList.add("scale-125", "bg-primary");
    }
    
    setTimeout(() => {
      cartIcon.classList.remove("scale-125");
      if (iconSpan) {
        iconSpan.classList.remove("scale-125");
      }
    }, 250);
  }, 1000);
};
