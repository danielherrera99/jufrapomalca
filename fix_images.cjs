const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const importRegex = /import api(.*?|[\s\S]*?)from '.*?api';?/;
const replaceImgVariables = (content, filePath) => {
  let newContent = content;
  let modified = false;

  // Pattern para <img src={variable} ...
  // Reemplazar src={variable} por src={getImageUrl(variable)}
  // Pero ignorar si ya tiene getImageUrl o si no es una variable local q venga del db
  // Mejor reemplazo manual en los matches que vimos
  
  if (content.includes('src={item.archivoUrl}') || 
      content.includes('src={item.archivo_url || item.archivoUrl}') ||
      content.includes('src={miembro.foto}') ||
      content.includes('src={user.codigoQR}') ||
      content.includes('src={conv.usuario1.foto}') ||
      content.includes('src={conv.usuario2.foto}') ||
      content.includes('src={post.image_url}') ||
      content.includes('src={readItem.archivoUrl}')) {
      
      newContent = newContent
          .replace(/src=\{item\.archivoUrl\}/g, 'src={getImageUrl(item.archivoUrl)}')
          .replace(/src=\{item\.archivo_url \|\| item\.archivoUrl\}/g, 'src={getImageUrl(item.archivo_url || item.archivoUrl)}')
          .replace(/src=\{miembro\.foto\}/g, 'src={getImageUrl(miembro.foto)}')
          .replace(/src=\{user\.codigoQR\}/g, 'src={getImageUrl(user.codigoQR)}')
          .replace(/src=\{conv\.usuario1\.foto\}/g, 'src={getImageUrl(conv.usuario1.foto)}')
          .replace(/src=\{conv\.usuario2\.foto\}/g, 'src={getImageUrl(conv.usuario2.foto)}')
          .replace(/src=\{post\.image_url\}/g, 'src={getImageUrl(post.image_url)}')
          .replace(/src=\{readItem\.archivoUrl\}/g, 'src={getImageUrl(readItem.archivoUrl)}');

      // Add import
      if (!newContent.includes('getImageUrl')) {
          return content; // If didn't replace, don't modify
      }
      
      if (!newContent.includes('import { getImageUrl }')) {
          // Find api import and add it
          const relPath = filePath.includes('views') ? '../../config/api' : '../config/api';
          newContent = `import { getImageUrl } from '${relPath}';\n` + newContent;
      }
      modified = true;
  }

  // En App.jsx y SafeImage.jsx 
  if (content.includes('src={src}')) {
      newContent = newContent.replace(/src=\{src\}/g, 'src={getImageUrl(src)}');
      if (newContent !== content && !newContent.includes('import { getImageUrl }')) {
          newContent = `import { getImageUrl } from './config/api';\n` + newContent;
          modified = true;
      }
  }

  return { newContent, modified };
}

walkDir(path.join(__dirname, 'src'), (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { newContent, modified } = replaceImgVariables(content, filePath);
    if (modified) {
      fs.writeFileSync(filePath, newContent);
      console.log('Modified:', filePath);
    }
  }
});
