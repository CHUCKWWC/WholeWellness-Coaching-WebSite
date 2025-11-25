import img1 from "@assets/IMG_9988_1764092678898.jpg";
import img2 from "@assets/IMG_0023_1764092678901.jpg";
import img5 from "@assets/IMG_0071_1764092678906.jpg";
import img6 from "@assets/IMG_1559_1764092678907.jpg";

const images = [
  { src: img1, alt: "Founders at PNC Bank partnership meeting" },
  { src: img2, alt: "Co-founders Charlene and Dasha together" },
  { src: "/attached_assets/FullSizeRender_1764092678902.JPEG", alt: "Team gathering at the marina" },
  { src: "/attached_assets/IMG_0102 (1)_1764092678904.JPG", alt: "Team bonding at home" },
  { src: img5, alt: "Team outing" },
  { src: img6, alt: "Beach day with the team" },
];

export default function HexagonCollage() {
  return (
    <div className="w-full py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-4">
          {/* Row 1: 3 hexagons */}
          <div className="flex justify-center gap-4 w-full">
            {images.slice(0, 3).map((image, index) => (
              <div
                key={index}
                className="relative w-32 h-36 sm:w-40 sm:h-44 md:w-48 md:h-52 overflow-hidden transform hover:scale-105 transition-transform duration-300"
                style={{
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}
                data-testid={`hexagon-image-${index + 1}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
          
          {/* Row 2: 3 hexagons offset */}
          <div className="flex justify-center gap-4 w-full -mt-6 sm:-mt-8 md:-mt-10">
            {images.slice(3, 6).map((image, index) => (
              <div
                key={index + 3}
                className="relative w-32 h-36 sm:w-40 sm:h-44 md:w-48 md:h-52 overflow-hidden transform hover:scale-105 transition-transform duration-300"
                style={{
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}
                data-testid={`hexagon-image-${index + 4}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
