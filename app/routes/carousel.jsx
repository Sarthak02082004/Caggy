import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Await, useLoaderData, Link } from 'react-router';
import { Image } from '@shopify/hydrogen';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Carousel() {
  return (
    <div className="homepage-carousel">

      <Swiper
        key="homepage-carousel"
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        autoplay={{ delay: 3000 }}
        loop={true}
        navigation
        pagination={{ clickable: true }}
        observer={true}
        observeParents={true}
        updateOnWindowResize
      >
        <SwiperSlide>
          <Link to="/collections/footwear">
            <Image
              src="/banner11.png"
              alt="banner"
              width={1600}
              height={600}
              sizes="100vw"
            />
          </Link>
        </SwiperSlide>

        <SwiperSlide>
          <Link to="/collections/gym-equipment-and-assesories">
            {/* <img src="/banner2.png" alt="banner2" /> */}
            <Image
              src="/banner2.png"
              alt="banner2"
              width={1600}
              height={600}
              sizes="100vw"
            />
          </Link>
        </SwiperSlide>

        {/* <SwiperSlide>
            <img src="/banner3.jpg" alt="banner3" />
          </SwiperSlide> */}

      </Swiper>

    </div>);
}

