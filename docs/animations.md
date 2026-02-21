# Animation Guidelines

## Overview
CivicGo uses Lottie animations to create an engaging and interactive user experience. This document outlines the guidelines for creating and implementing animations in the app.

## Animation Files
- All animation files should be placed in the `/public/animations/` directory
- Use the Lottie JSON format (.json)
- Keep file sizes under 300KB for optimal performance
- Target 30fps for smoother performance on mobile devices

## Current Animations
- `civicgo-welcome.json`: Welcome screen animation showing a stylized cityscape with the CivicGo logo
- `welcome-animation.json`: Simple placeholder animation

## Creating New Animations
You can create Lottie animations using:
1. Adobe After Effects with the Bodymovin plugin
2. [LottieFiles](https://lottiefiles.com/) online editor
3. Other animation tools that export to Lottie JSON format

## Implementation
Animations are implemented using the `AnimationContainer` component, which provides:
- Automatic loading states
- Fallback to static images when animations fail to load
- Theming support (dark/light mode)
- Accessibility features

Example usage:
```tsx
<AnimationContainer 
  animationPath="/animations/civicgo-welcome.json" 
  fallbackImageUrl="https://example.com/fallback.jpg"
  altText="Description of the animation for accessibility" 
  className="w-full h-64 rounded-2xl shadow-lg"
  loop={true}
  autoplay={true}
/>
```

## Performance Considerations
- Use animations sparingly on critical paths
- Consider providing static alternatives for low-power devices
- Test animations on various device types to ensure performance

## Accessibility
- Always provide meaningful `altText` descriptions
- Avoid animations that may trigger vestibular disorders
- Consider adding a "reduce motion" setting that respects the user's OS preferences
