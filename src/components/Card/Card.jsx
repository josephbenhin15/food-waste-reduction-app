function Card({ image, title, icon }) {
return (
<div className="relative rounded-xl overflow-hidden group cursor-pointer">

{/* Image */}  
  <img   
    src={image}   
    alt={title}  
    className="h-40 w-full object-cover group-hover:scale-110 transition duration-500"  
  />  

  {/* Gradient overlay */}  
  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>  

  {/* Text + icon */}  
  <div className="absolute bottom-2 left-3 flex items-center gap-2">  
    {icon}  
    <h3 className="text-white text-sm font-medium">  
      {title}  
    </h3>  
  </div>  
</div>

);
}

export default Card;