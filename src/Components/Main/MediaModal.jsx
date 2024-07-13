// src/components/MediaModal.jsx

import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const MediaModal = ({ media, selectedMediaIndex, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full md:w-3/4 lg:w-1/2">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          Close
        </button>
        <Carousel selectedItem={selectedMediaIndex} showThumbs={false}>
          {media.map((url, index) => (
            <div key={index}>
              {url.includes('.jpg') ||
              url.includes('.jpeg') ||
              url.includes('.png') ||
              url.includes('.gif') ? (
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
              ) : url.includes('.mp4') ||
                url.includes('.webm') ||
                url.includes('.ogg') ? (
                <video
                  src={url}
                  controls
                  className="w-full h-auto object-cover"
                />
              ) : null}
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default MediaModal;
