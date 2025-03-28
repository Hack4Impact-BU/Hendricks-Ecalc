
const Contact = () => {
  return(

    <div className="flex flex-row flex-wrap justify-start items-center px-[24px] py-[40px]">
      
      {/* Left side – Contact Info box */}
      <div className="flex flex-col flex-wrap justify-start items-stretch z-1 lg:mr-[-280px] bg-black text-white p-8 rounded-2xl shadow-lg w-full mx-auto lg:w-[30%]">
        
        {/* Title */}
        <h2 className="text-2xl font-bold mb-4 text-center">Contact Us</h2>

        {/* Email */}
        <div className="mb-4">
          <p className="font-semibold">Email</p>
          <a href="mailto:info@hendricks-foundation.org" className="text-yellow-300 underline">
            info@hendricks-foundation.org
          </a>
        </div>

        {/* Socials */}
        <div>
          <p className="font-semibold mb-2">Socials</p>
          <div className="flex space-x-4 text-2xl">
            <i className="fab fa-facebook"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-instagram"></i>
          </div>
        </div>
      </div>

      {/* Form container */}
      <div className="w-full mx-auto mt-[24px] lg:mt-0 lg:max-w-[700px] bg-white/50 backdrop-blur-md p-6 lg:pl-[200px] lg:pr-[150px] lg:py-16 rounded-2xl shadow-md">
        
        {/* Title for the form */}
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.25)' }}>Message Us</h1>
          <p className="mb-6 font-normal">Fill out the form below!</p>
        </div>
        
        {/* Start of form */}
        <form className="flex flex-col gap-5 ">

        {/* Name */}
        <div className="flex flex-col">
          <label className="text-black font-bitter font-medium text-lg mb-1">Name:</label>
          <input
            type="text"
            placeholder="Enter your name"
            value=""
            required
            className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-black font-bitter font-medium text-lg mb-1">Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value=""
            required
            className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
          />
        </div>

        {/* Subject */}
        <div className="flex flex-col">
          <label className="text-black font-bitter font-medium text-lg mb-1">Subject:</label>
          <input
            type="text"
            placeholder="Email subject"
            value=""
            required
            className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col">
          <label className="text-black font-bitter font-medium text-lg mb-1">Message:</label>
          <input
            type="text"
            placeholder="Write your message..."
            value=""
            required
            className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
          />
        </div>

        {/* Button */}
        <div className="flex flex-col justify-center items-center mt-3">
          <button
            className="w-full bg-[#FFE017] shadow-md text-white font-bold text-lg py-2 px-10 rounded-full transition duration-200 cursor-pointer hover:brightness-105"
            type="submit">Send</button>
        </div>
      </form>
    </div>
  </div>
  )
}

export default Contact