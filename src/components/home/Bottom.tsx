import Image from "next/image";
import Link from "next/link";

export const BottomSection = () => {
  return (
    <div className="w-full bg-white px-4 sm:px-6 md:px-10 lg:px-20 py-16">
      <div className="px-8 mx-auto max-w-6xl relative w-full h-[400px] sm:h-[500px] rounded-lg overflow-hidden">
        {/* Background Image */}
        <Image
          src="/home/smile.png"
          alt="Modern luxury accommodation"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-6">
          {/* Center the text vertically */}
          <div className="flex flex-col justify-center flex-grow">
            <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl text-white mb-6 sm:mb-8 max-w-xl">
              Would you like <br />
              to become a <br />
              host?
            </h1>
          </div>

          {/* Button at the bottom */}
          <div className="mt-auto mb-12">
            <Link
              href="/explore"
              className="inline-flex items-center px-6 py-3 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
            >
              Start Here
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
