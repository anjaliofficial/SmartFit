import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import Header from "../components/header";
import Footer from "../components/footer";

// Collapsible FAQ item
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-2">
      <button
        className="w-full text-left flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{question}</span>
        <span>{isOpen ? "-" : "+"}</span>
      </button>
      {isOpen && <p className="mt-2 text-gray-600">{answer}</p>}
    </div>
  );
};

const ContactUs = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for contacting us!");
    e.target.reset(); // reset form after submit
  };

  return (
    <>
    <Header/>
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold">We are always here to Help you</h2>
        <p className="text-gray-500 mt-2">
          If you have any questions or need assistance, please reach out to us. 
          We're always happy to help!
        </p>
      </div>

      {/* Contact Form */}
      <div className="mb-10">
        <h3 className="font-semibold mb-2">Contact Form</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
          <textarea
            name="message"
            placeholder="Message"
            className="w-full border border-gray-300 rounded-md p-2 h-32"
            required
          />

          {/* Submit Button aligned to right */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Other Way to Contact */}
      <div className="mb-10">
        <h3 className="font-semibold mb-2">Other Way to Contact Us</h3>
        <div className="flex items-center justify-between border border-gray-300 rounded-md p-2">
          <FaEnvelope className="text-cyan-500 w-5 h-5" />
          <span className="text-gray-700">support.smartfit.com</span>
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
        <FAQItem
          question="How do I add items to my closet?"
          answer="You can add items by clicking the 'Add to Closet' button on the product page."
        />
        <FAQItem
          question="How does the outfit compatibility feature work?"
          answer="The feature suggests outfits based on your existing closet items and style preferences."
        />
        <FAQItem
          question="What are the benefits of using SmartFit?"
          answer="SmartFit helps you organize your wardrobe, plan outfits, and get personalized style recommendations."
        />
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default ContactUs;
