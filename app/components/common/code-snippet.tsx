import React from 'react';

export const CodeSnippet = () => {
  return (
    <div style={{
      padding: '10px',
      backgroundColor: 'black',
      borderRadius: '5px',
    
    }}>
      <pre style={{margin: 0}}>
        <code className="javascript" style={{
          // backgroundColor: '#f8f8f8',
          color: 'white',
          borderRadius: '5px',
        
        }}>
          {`SOURCE_NAME,FEEDBACK,00/00/0000`}
        </code>
      </pre>
    </div>
  );
};

// .javascript {
//   color: #f44336; /* Set color for JavaScript code */
// }