/**
 * Example Usage Guide
 * How to implement the organic design system in your components
 */

/**
 * EXAMPLE 1: Basic Animal Page Layout
 */
// import { OrganicLayout } from "@/components/organic"
// import type { AnimalType } from "@/lib/types"
//
// export default function AnimalPage({ animalType }: { animalType: AnimalType }) {
//   return (
//     <OrganicLayout animalType={animalType}>
//       {/* Your content here */}
//       <div className="p-12">
//         <h1>Welcome to {animalType}</h1>
//       </div>
//     </OrganicLayout>
//   )
// }

/**
 * EXAMPLE 2: Animated Product Card
 */
// import { OrganicCard, OrganicTransition } from "@/components/organic"
// import type { AnimalType } from "@/lib/types"
//
// export function ProductCard({ animalType }: { animalType: AnimalType }) {
//   return (
//     <OrganicCard animalType={animalType} glowEffect>
//       <div className="p-6">
//         <h3>Product Title</h3>
//         <p>Product description with organic feel</p>
//       </div>
//     </OrganicCard>
//   )
// }

/**
 * EXAMPLE 3: Using Hooks for Custom Animations
 */
// import { useOrganicAnimation, useColorPalette } from "@/hooks/useOrganic"
// import type { AnimalType } from "@/lib/types"
//
// export function AnimatedText({ animalType, text }: { animalType: AnimalType; text: string }) {
//   const animation = useOrganicAnimation(animalType, "float")
//   const palette = useColorPalette(animalType)
//
//   return (
//     <div
//       style={{
//         animation: `${animation}`,
//         color: palette.accent,
//       }}
//     >
//       {text}
//     </div>
//   )
// }

/**
 * EXAMPLE 4: Building a Modal with Organic Transitions
 */
// import { OrganicTransition } from "@/components/organic"
// import { useOrganicVisibility } from "@/hooks/useOrganic"
// import type { AnimalType } from "@/lib/types"
//
// export function OrganicModal({ animalType }: { animalType: AnimalType }) {
//   const { isVisible, show, hide, transition } = useOrganicVisibility(animalType)
//
//   return (
//     <>
//       <button onClick={show}>Open Modal</button>
//
//       {isVisible && (
//         <OrganicTransition animalType={animalType} trigger>
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
//             <div className="bg-white rounded-2xl p-8">
//               <h2>Modal Content</h2>
//               <button onClick={hide}>Close</button>
//             </div>
//           </div>
//         </OrganicTransition>
//       )}
//     </>
//   )
// }

/**
 * EXAMPLE 5: Generating Organic Backgrounds Dynamically
 */
// import { generateOrganicBackground, getBackgroundDataUri } from "@/lib/organic"
// import type { AnimalType } from "@/lib/types"
//
// export function DynamicBackgroundSection({ animalType }: { animalType: AnimalType }) {
//   const bgUri = getBackgroundDataUri(animalType)
//
//   return (
//     <div
//       style={{
//         backgroundImage: `url('${bgUri}')`,
//         backgroundSize: "cover",
//       }}
//       className="w-full h-96"
//     />
//   )
// }

/**
 * EXAMPLE 6: Complete Product Gallery with Organic Effects
 */
// import { OrganicLayout, OrganicCard, OrganicTransition } from "@/components/organic"
// import { useOrganicAnimation, useAnimationClass } from "@/hooks/useOrganic"
// import type { AnimalType } from "@/lib/types"
//
// export function ProductGallery({
//   animalType,
//   products,
// }: {
//   animalType: AnimalType
//   products: any[]
// }) {
//   const animationClass = useAnimationClass(animalType, "float")
//
//   return (
//     <OrganicLayout animalType={animalType}>
//       <div className="grid grid-cols-3 gap-8 p-12">
//         {products.map((product, idx) => (
//           <OrganicTransition
//             key={product.id}
//             animalType={animalType}
//             trigger={idx % 2 === 0}
//           >
//             <OrganicCard animalType={animalType} className={animationClass}>
//               <img src={product.image} alt={product.name} />
//               <h3>{product.name}</h3>
//               <p>${product.price}</p>
//             </OrganicCard>
//           </OrganicTransition>
//         ))}
//       </div>
//     </OrganicLayout>
//   )
// }

/**
 * EXAMPLE 7: Accessing Personality Directly
 */
// import { getAnimalPersonality, getPaletteFromPersonality } from "@/lib/organic"
// import type { AnimalType } from "@/lib/types"
//
// export function ThemeSelector({ animalType }: { animalType: AnimalType }) {
//   const personality = getAnimalPersonality(animalType)
//   const palette = getPaletteFromPersonality(animalType)
//
//   return (
//     <div style={{ backgroundColor: palette.light }}>
//       <h2>Energy Level: {personality.energyLevel}</h2>
//       <h2>Rhythm: {personality.rhythmPattern}</h2>
//       <div
//         style={{
//           width: "100px",
//           height: "100px",
//           backgroundColor: palette.accent,
//           borderRadius: "8px",
//         }}
//       />
//     </div>
//   )
// }

/**
 * EXAMPLE 8: Building a Navigation with Organic Transitions
 */
// import { getStaggerDelay } from "@/lib/organic"
// import type { AnimalType } from "@/lib/types"
//
// export function OrganicNav({ animalType }: { animalType: AnimalType }) {
//   const items = ["Home", "Products", "About", "Contact"]
//
//   return (
//     <nav className="flex gap-8">
//       {items.map((item, idx) => (
//         <a
//           key={item}
//           href={`/${item.toLowerCase()}`}
//           style={{
//             animation: `fadeInUp 600ms ease-out ${getStaggerDelay(animalType, idx)}ms both`,
//           }}
//         >
//           {item}
//         </a>
//       ))}
//     </nav>
//   )
// }

export const EXAMPLE_USAGE_DOCUMENTED = true
