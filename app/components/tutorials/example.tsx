import React from 'react';

export const ExampleTutorial = () => {
  return (
    <div className="flex flex-col gap-4">
      <p>Welcome to our beginner's guide on how to break into the tech industry as a software developer! In this tutorial, we'll cover essential steps and tips to help you kickstart your journey.</p>

      <h2 className='font-bold'>Prerequisites</h2>
      <ul className='list-inside'>
        <li className='list-disc'>Basic understanding of programming concepts (e.g., variables, loops, functions).</li>
        <li className='list-disc'>Passion for learning and problem-solving.</li>
        <li className='list-disc'>Access to online resources and communities.</li>
      </ul>

      <h2 className='font-bold'>Step 1: Learn the Fundamentals</h2>
      <ol className='list-inside flex flex-col gap-4'>
        <li className='list-decimal'>Choose a Programming Language:</li>
        <code>Start with a language like JavaScript, Python, or Java. Focus on mastering the basics before diving into frameworks or libraries.</code>
        
        <li className='list-decimal'>Understand Data Structures and Algorithms:</li>
        <code>Study common data structures (arrays, linked lists, trees) and algorithms (sorting, searching) to improve your problem-solving skills.</code>
      </ol>

      <h2 className='font-bold'>Step 2: Build Projects</h2>
      <ol className='list-inside flex flex-col gap-4'>
        <li className='list-decimal'>Create Personal Projects:</li>
        <code>Build small projects (e.g., a to-do app, a simple game) to apply what you've learned and showcase your skills to potential employers.</code>
        
        <li className='list-decimal'>Contribute to Open Source:</li>
        <code>Join open-source projects on platforms like GitHub. Contribute code, fix bugs, and collaborate with other developers to gain experience.</code>
      </ol>

      <h2 className='font-bold'>Step 3: Network and Learn</h2>
      <ol className='list-inside flex flex-col gap-4'>
        <li className='list-decimal'>Attend Tech Meetups and Events:</li>
        <code>Join local tech meetups, workshops, and conferences to network with professionals and learn about industry trends.</code>
        
        <li className='list-decimal'>Join Online Communities:</li>
        <code>Participate in online forums, Slack channels, and social media groups related to software development. Connect with peers and seek mentorship.</code>
      </ol>

      <h2 className='font-bold'>Step 4: Prepare for Interviews</h2>
      <ol className='list-inside flex flex-col gap-4'>
        <li className='list-decimal'>Practice Coding Interviews:</li>
        <code>Practice coding challenges and mock interviews on platforms like LeetCode, HackerRank, and CodeSignal to improve your problem-solving and coding skills.</code>
        
        <li className='list-decimal'>Build a Portfolio:</li>
        <code>Create a portfolio website showcasing your projects, skills, and experiences. Tailor your resume and cover letter for software development roles.</code>
      </ol>

      <h2 className='font-bold'>Step 5: Apply and Keep Learning</h2>
      <ol className='list-inside flex flex-col gap-4'>
        <li className='list-decimal'>Apply for Entry-Level Positions:</li>
        <code>Apply for junior or entry-level software developer positions. Highlight your projects, contributions, and willingness to learn in your applications.</code>
        
        <li className='list-decimal'>Continuously Learn and Adapt:</li>
        <code>Stay updated with industry trends, new technologies, and best practices. Keep learning, practicing, and improving your skills as a software developer.</code>
      </ol>

      <p>Congratulations on taking the first steps towards breaking into the tech industry as a software developer! Stay dedicated, keep learning, and embrace the challenges and opportunities along the way.</p>
    </div>
  );
}