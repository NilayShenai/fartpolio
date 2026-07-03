import React from 'react';

// Regex matches ?<term>definition? and ?(term)definition?
// Group 1: term (bracket form), Group 2: term (paren form), Group 3: definition
const TOOLTIP_REGEX = /\?(?:<([^>]+)>|\(([^)]+)\))([^?]+)\?/g;

export function parseTooltipText(text: string | undefined): React.ReactNode {
  if (!text) return '';
  
  // Reset regex state
  TOOLTIP_REGEX.lastIndex = 0;
  if (!TOOLTIP_REGEX.test(text)) return text;
  
  TOOLTIP_REGEX.lastIndex = 0;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = TOOLTIP_REGEX.exec(text)) !== null) {
    const matchIndex = match.index;
    const term = match[1] || match[2];
    const definition = match[3];
    
    // Text before match
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    
    // Render hoverable tooltip span
    parts.push(
      <span 
        key={matchIndex} 
        className="custom-tooltip-trigger" 
        data-tooltip={definition}
      >
        {term}
      </span>
    );
    
    lastIndex = TOOLTIP_REGEX.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return <>{parts}</>;
}

export function parseTooltipDOM(root: HTMLElement) {
  // Reset regex state
  TOOLTIP_REGEX.lastIndex = 0;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodesToReplace: { node: Text; parent: Node; newNodes: Node[] }[] = [];
  
  let currentNode = walker.nextNode() as Text | null;
  while (currentNode) {
    const text = currentNode.nodeValue || '';
    
    // Reset regex check
    TOOLTIP_REGEX.lastIndex = 0;
    if (TOOLTIP_REGEX.test(text)) {
      TOOLTIP_REGEX.lastIndex = 0;
      
      const parent = currentNode.parentNode;
      if (
        parent && 
        parent.nodeName !== 'SCRIPT' && 
        parent.nodeName !== 'STYLE' && 
        parent.nodeName !== 'CODE' && 
        parent.nodeName !== 'PRE' &&
        !(parent as HTMLElement).classList.contains('custom-tooltip-trigger')
      ) {
        const parts: Node[] = [];
        let lastIndex = 0;
        let match;
        
        while ((match = TOOLTIP_REGEX.exec(text)) !== null) {
          const matchIndex = match.index;
          const term = match[1] || match[2];
          const definition = match[3];
          
          // Text before match
          if (matchIndex > lastIndex) {
            parts.push(document.createTextNode(text.substring(lastIndex, matchIndex)));
          }
          
          // Create tooltip span element
          const span = document.createElement('span');
          span.className = 'custom-tooltip-trigger';
          span.textContent = term;
          span.setAttribute('data-tooltip', definition);
          
          parts.push(span);
          lastIndex = TOOLTIP_REGEX.lastIndex;
        }
        
        // Text after match
        if (lastIndex < text.length) {
          parts.push(document.createTextNode(text.substring(lastIndex)));
        }
        
        nodesToReplace.push({
          node: currentNode,
          parent,
          newNodes: parts
        });
      }
    }
    currentNode = walker.nextNode() as Text | null;
  }
  
  // Replace nodes
  nodesToReplace.forEach(({ node, parent, newNodes }) => {
    newNodes.forEach(newNode => {
      parent.insertBefore(newNode, node);
    });
    parent.removeChild(node);
  });
}
