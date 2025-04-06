import React from 'react';

/**
 * Color Palette component to showcase all the custom Storai colors
 */
export const ColorPalette: React.FC = () => {
  const colors = [
    { name: 'Aquamarine', tailwind: 'bg-storai-aquamarine', hex: '#7FFFD6', cssVar: 'var(--color-storai-aquamarine)' },
    { name: 'Mint', tailwind: 'bg-storai-mint', hex: '#03FAC5', cssVar: 'var(--color-storai-mint)' },
    { name: 'Jade', tailwind: 'bg-storai-jade', hex: '#00CC9C', cssVar: 'var(--color-storai-jade)' },
    { name: 'Cadet', tailwind: 'bg-storai-cadet', hex: '#5F9F9E', cssVar: 'var(--color-storai-cadet)' },
    { name: 'Teal', tailwind: 'bg-storai-teal', hex: '#009293', cssVar: 'var(--color-storai-teal)' },
    { name: 'Turquoise', tailwind: 'bg-storai-turquoise', hex: '#008080', cssVar: 'var(--color-storai-turquoise)' },
    { name: 'Sky', tailwind: 'bg-storai-sky', hex: '#C9EDEF', cssVar: 'var(--color-storai-sky)' },
    { name: 'Seafoam', tailwind: 'bg-storai-seafoam', hex: '#BEF3EA', cssVar: 'var(--color-storai-seafoam)' },
    { name: 'Azure', tailwind: 'bg-storai-azure', hex: '#B3F0F9', cssVar: 'var(--color-storai-azure)' },
    { name: 'Blue', tailwind: 'bg-storai-blue', hex: '#2388FF', cssVar: 'var(--color-storai-blue)' },
    { name: 'Light Gray', tailwind: 'bg-storai-light-gray', hex: '#F7F8FA', cssVar: 'var(--color-storai-light-gray)' },
    { name: 'Gray', tailwind: 'bg-storai-gray', hex: '#666F8D', cssVar: 'var(--color-storai-gray)' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Storai Color Palette</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {colors.map((color) => (
          <div key={color.name} className="border rounded-lg overflow-hidden shadow-sm">
            <div className={`${color.tailwind} h-24`}></div>
            <div className="p-4">
              <h3 className="font-medium text-lg">{color.name}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="font-mono bg-gray-100 px-1 rounded">Tailwind:</span> {color.tailwind}</p>
                <p><span className="font-mono bg-gray-100 px-1 rounded">Hex:</span> {color.hex}</p>
                <p><span className="font-mono bg-gray-100 px-1 rounded">CSS Variable:</span> {color.cssVar}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <h2 className="text-xl font-bold mt-12 mb-6">Example Usage</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="font-medium text-lg mb-4">Buttons</h3>
          <div className="space-y-4">
            <button className="btn btn-storai">Storai Button</button>
            <div>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
                {`<button className="btn btn-storai">
  Storai Button
</button>`}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="font-medium text-lg mb-4">Text Colors</h3>
          <div className="space-y-2">
            <p className="text-storai-jade">Text in Jade color</p>
            <p className="text-storai-teal">Text in Teal color</p>
            <p className="text-storai-blue">Text in Blue color</p>
            <div>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
                {`<p className="text-storai-jade">Text in Jade color</p>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPalette; 