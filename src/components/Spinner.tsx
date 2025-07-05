import { Loader2 } from 'lucide-react';
import React from 'react';

const Spinner = () => {
  return (
    <div className='max-w-7xl mx-auto'>
    <div className="flex justify-center items-center h-screen">
      <Loader2 className='animate-spin'/>
    </div>
    </div>
  );
};

export default Spinner;
