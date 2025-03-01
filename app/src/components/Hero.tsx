'use client';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import WalletConnectButton from './WalletConnectButton';
import Link from 'next/link';

const CarouselItems = [
  'https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp',
  'https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp',
  'https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp',
];

const gradients = [
  'bg-gradient-to-r from-blue-500 to-purple-500',
  'bg-gradient-to-r from-red-500 to-orange-500',
  'bg-gradient-to-r from-green-500 to-teal-500',
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const { isConnected } = useAccount();

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // Fade out the current image
  //     setOpacity(0);
  //     // After the fade-out, update the image and fade back in
  //     setTimeout(() => {
  //       setCurrent((prev) => (prev + 1) % CarouselItems.length);
  //       setOpacity(1);
  //     }, 1000);
  //   }, 10_000);

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="z-0 flex h-[600px] w-full flex-row justify-between gap-10 p-2">
      <div className="flex w-1/2 flex-col items-start justify-center py-10 pr-10">
        <h1 className="mb-5 text-6xl font-bold">Learn. Compete. Earn. Win</h1>
        <div className="flex gap-5">
          {isConnected ? (
            <>
              <Link
                href="/dashboard/create-project"
                className="btn btn-primary"
              >
                Create Project
              </Link>
              <Link href="/dashboard" className="btn btn-secondary">
                Submit Work
              </Link>
            </>
          ) : (
            <WalletConnectButton />
          )}
        </div>
      </div>

      <div className="relative flex w-1/2 items-center justify-center">
        <div
          className={`${gradients[current]} absolute inset-0 rounded-lg transition-all duration-500`}
          style={{ animation: 'gradientFlow 0.5s ease-in-out forwards' }}
        ></div>
        <img
          src={CarouselItems[current]}
          alt="Carousel"
          className="relative z-10 max-h-[80%] max-w-[80%] rounded-lg object-contain"
          style={{ opacity, transition: 'opacity 0.5s ease-in-out' }}
        />
      </div>
    </div>
  );
}
