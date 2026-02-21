import React, { useState } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';

const AnimationDemo: React.FC = () => {
  const [intensity, setIntensity] = useState<'subtle' | 'medium' | 'intense'>('medium');

  const intensities = [
    { value: 'subtle' as const, name: 'Subtle', description: 'Minimal visual impact' },
    { value: 'medium' as const, name: 'Medium', description: 'Balanced animation intensity' },
    { value: 'intense' as const, name: 'Intense', description: 'Maximum visual impact' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Lottie Animation Demo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Animation Controls
            </h2>

            {/* Intensity Selection */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                Intensity Level
              </h3>
              <div className="space-y-2">
                {intensities.map((intensityOption) => (
                  <button
                    key={intensityOption.value}
                    onClick={() => setIntensity(intensityOption.value)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      intensity === intensityOption.value
                        ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium">{intensityOption.name}</div>
                    <div className="text-sm opacity-75">{intensityOption.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Live Preview
            </h2>
            <div className="relative h-96 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden">
              <AnimatedBackground
                intensity={intensity}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-900 dark:text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    Lottie Animation
                  </h3>
                  <p className="text-lg opacity-75">
                    {intensities.find(i => i.value === intensity)?.name} Intensity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Usage Example
          </h2>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`<div className="relative">
  <AnimatedBackground
    intensity="${intensity}"
  />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationDemo;
