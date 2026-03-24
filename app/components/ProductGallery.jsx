import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import { Image } from "@shopify/hydrogen";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export function ProductGallery({ images }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  return (
    <div className="product-gallery">

      {/* MAIN IMAGE FIRST */}
      <Swiper
        modules={[Navigation, Thumbs]}
        navigation
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        className="main-swiper"
      >
        {images.map((img) => (
          <SwiperSlide key={img.id}>
            <Image data={img} sizes="(min-width: 768px) 50vw, 100vw" />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* THUMBNAILS */}
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        watchSlidesProgress
        className="thumbnail-swiper"
        breakpoints={{
          0: {
            direction: "horizontal",
            slidesPerView: 4,
          },
          768: {
            direction: "vertical",
            slidesPerView: 4,
          },
        }}
      >
        {images.map((img) => (
          <SwiperSlide key={img.id}>
            <Image data={img} width={80} height={80} />
          </SwiperSlide>
        ))}
      </Swiper>

    </div>
  );
}