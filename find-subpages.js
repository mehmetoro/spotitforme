#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.clear();
console.log('🔍 SPOTITFORME - Otomatik Alt Sayfa Bulucu\n');

const PROJECT_ROOT = process.cwd();
const TARGET_PAGE = process.argv[2] || 'app/admin/page.tsx';

// Toplanan dosyalar
const collected = new Map();
const visited = new Set();
const foundPages = new Set();

// Normalize path
function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

// Bir dizindeki TÜM page.tsx dosyalarını recursive bul
function findAllPageFiles(dir) {
  const pages = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        // Alt dizinleri de ara (recursive)
        pages.push(...findAllPageFiles(fullPath));
      } else if (item.isFile()) {
        // page.tsx, layout.tsx, loading.tsx, error.tsx dosyalarını bul
        if (item.name.match(/^(page|layout|loading|error|not-found)\.(tsx|jsx|ts|js)$/)) {
          pages.push(fullPath);
        }
      }
    }
  } catch (err) {
    console.warn(`⚠️  Dizin okunamadı: ${dir}`);
  }
  
  return pages;
}

// Import'ları çöz
function resolveImport(importPath, fromFile) {
  const fromDir = path.dirname(fromFile);
  
  if (importPath.startsWith('@/')) {
    return path.join(PROJECT_ROOT, importPath.replace('@/', ''));
  }
  
  if (importPath.startsWith('.')) {
    return path.resolve(fromDir, importPath);
  }
  
  return null;
}

// Dosya bul
function findFile(filePath) {
  if (fs.existsSync(filePath)) return filePath;
  
  const extensions = ['.ts', '.tsx', '.js', '.jsx', ''];
  for (const ext of extensions) {
    const testPath = filePath + ext;
    if (fs.existsSync(testPath)) return testPath;
  }
  
  // index dosyası
  for (const ext of extensions) {
    const indexPath = path.join(filePath, 'index' + ext);
    if (fs.existsSync(indexPath)) return indexPath;
  }
  
  return null;
}

// Import'ları çıkar
function extractImports(content) {
  const imports = new Set();
  const patterns = [
    /from\s+['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.add(match[1]);
    }
  });
  
  return Array.from(imports);
}

// Dosyayı ve bağımlılıklarını topla
function collectFile(filePath, depth = 0) {
  if (depth > 10) return;
  
  const normalized = normalizePath(path.resolve(filePath));
  if (visited.has(normalized) || !fs.existsSync(normalized)) return;
  
  visited.add(normalized);
  
  let content;
  try {
    content = fs.readFileSync(normalized, 'utf-8');
  } catch (err) {
    return;
  }
  
  collected.set(normalized, content);
  
  const relPath = normalizePath(path.relative(PROJECT_ROOT, normalized));
  console.log(`${'  '.repeat(depth)}📄 ${relPath}`);
  
  // Import'ları takip et
  const imports = extractImports(content);
  for (const imp of imports) {
    // External modülleri atla
    if (imp.match(/^(react|next|lucide|@supabase|@radix|recharts)/) || 
        (imp.includes('/') && !imp.startsWith('.') && !imp.startsWith('@/'))) {
      continue;
    }
    
    const resolved = resolveImport(imp, normalized);
    if (resolved) {
      const found = findFile(resolved);
      if (found) {
        collectFile(found, depth + 1);
      }
    }
  }
}

// Çıktı oluştur
function createOutput() {
  const timestamp = Date.now();
  const outputFile = `complete-admin-${timestamp}.txt`;
  
  let output = [];
  
  output.push('='.repeat(100));
  output.push('📦 SPOTITFORME - TÜM ADMIN PANELİ VE ALT SAYFALAR');
  output.push('='.repeat(100));
  output.push('');
  output.push(`🎯 Başlangıç: ${TARGET_PAGE}`);
  output.push(`📅 Tarih: ${new Date().toLocaleString('tr-TR')}`);
  output.push(`📊 Toplam: ${collected.size} dosya`);
  output.push(`🌐 Bulunan Sayfalar: ${foundPages.size}`);
  output.push('');
  
  // Dosyaları grupla
  const filesByType = {
    appPages: [],      // page.tsx dosyaları
    appLayouts: [],    // layout.tsx dosyaları  
    appOthers: [],     // loading.tsx, error.tsx
    components: [],
    lib: [],
    others: []
  };
  
  Array.from(collected.keys()).forEach(filePath => {
    const relPath = normalizePath(path.relative(PROJECT_ROOT, filePath));
    const fileName = path.basename(relPath);
    const dirName = path.dirname(relPath);
    
    if (relPath.startsWith('app/')) {
      if (fileName === 'page.tsx' || fileName === 'page.jsx') {
        filesByType.appPages.push({ path: filePath, rel: relPath });
        // Sayfa yolunu kaydet
        const pageRoute = '/' + relPath
          .replace(/^app\//, '')
          .replace(/\/page\.(tsx|jsx|ts|js)$/, '')
          .replace(/\/index$/, '');
        foundPages.add(pageRoute);
      } else if (fileName === 'layout.tsx' || fileName === 'layout.jsx') {
        filesByType.appLayouts.push({ path: filePath, rel: relPath });
      } else if (fileName.match(/^(loading|error|not-found)\./)) {
        filesByType.appOthers.push({ path: filePath, rel: relPath });
      } else {
        filesByType.others.push({ path: filePath, rel: relPath });
      }
    } else if (relPath.startsWith('components/')) {
      filesByType.components.push({ path: filePath, rel: relPath });
    } else if (relPath.startsWith('lib/')) {
      filesByType.lib.push({ path: filePath, rel: relPath });
    } else {
      filesByType.others.push({ path: filePath, rel: relPath });
    }
  });
  
  // Sayfa haritası
  output.push('='.repeat(100));
  output.push('🗺️  SAYFA HARİTASI');
  output.push('='.repeat(100));
  output.push('');
  
  if (foundPages.size > 0) {
    const sortedPages = Array.from(foundPages).sort();
    sortedPages.forEach(page => {
      output.push(`• ${page}`);
      
      // Bu sayfanın layout/loading dosyalarını bul
      const pageDir = page === '/' ? 'app' : `app/${page}`;
      filesByType.appLayouts.forEach(layout => {
        if (layout.rel.startsWith(pageDir + '/') && layout.rel.includes('layout.')) {
          output.push(`  └─ 📁 ${path.basename(layout.rel)}`);
        }
      });
      
      filesByType.appOthers.forEach(other => {
        if (other.rel.startsWith(pageDir + '/') && 
            (other.rel.includes('loading.') || other.rel.includes('error.'))) {
          output.push(`  └─ ⚡ ${path.basename(other.rel)}`);
        }
      });
    });
  } else {
    output.push('⚠️  Hiç sayfa bulunamadı');
  }
  
  output.push('');
  
  // 1. APP SAYFALARI
  if (filesByType.appPages.length > 0) {
    output.push('='.repeat(100));
    output.push('📱 APP SAYFALARI (page.tsx)');
    output.push('='.repeat(100));
    output.push('');
    
    filesByType.appPages.sort((a, b) => a.rel.localeCompare(b.rel)).forEach(file => {
      const content = collected.get(file.path);
      const lines = content.split('\n').length;
      
      output.push(`📄 ${file.rel}`);
      output.push(`📊 ${lines} satır`);
      output.push('─'.repeat(60));
      output.push('');
      output.push(content);
      output.push('');
    });
  }
  
  // 2. APP LAYOUT'LARI
  if (filesByType.appLayouts.length > 0) {
    output.push('='.repeat(100));
    output.push('🏗️  APP LAYOUT\'LARI');
    output.push('='.repeat(100));
    output.push('');
    
    filesByType.appLayouts.sort((a, b) => a.rel.localeCompare(b.rel)).forEach(file => {
      const content = collected.get(file.path);
      const lines = content.split('\n').length;
      
      output.push(`📄 ${file.rel}`);
      output.push(`📊 ${lines} satır`);
      output.push('─'.repeat(60));
      output.push('');
      output.push(content);
      output.push('');
    });
  }
  
  // 3. DİĞER APP DOSYALARI
  if (filesByType.appOthers.length > 0) {
    output.push('='.repeat(100));
    output.push('⚡ DİĞER APP DOSYALARI');
    output.push('='.repeat(100));
    output.push('');
    
    filesByType.appOthers.sort((a, b) => a.rel.localeCompare(b.rel)).forEach(file => {
      const content = collected.get(file.path);
      const lines = content.split('\n').length;
      
      output.push(`📄 ${file.rel}`);
      output.push(`📊 ${lines} satır`);
      output.push('─'.repeat(60));
      output.push('');
      output.push(content);
      output.push('');
    });
  }
  
  // 4. COMPONENT'LER
  if (filesByType.components.length > 0) {
    output.push('='.repeat(100));
    output.push('🧩 COMPONENT\'LER');
    output.push('='.repeat(100));
    output.push('');
    
    filesByType.components.sort((a, b) => a.rel.localeCompare(b.rel)).forEach(file => {
      const content = collected.get(file.path);
      const lines = content.split('\n').length;
      
      output.push(`📄 ${file.rel}`);
      output.push(`📊 ${lines} satır`);
      output.push('─'.repeat(60));
      output.push('');
      output.push(content);
      output.push('');
    });
  }
  
  // 5. LIB DOSYALARI
  if (filesByType.lib.length > 0) {
    output.push('='.repeat(100));
    output.push('🔧 UTILITY DOSYALARI');
    output.push('='.repeat(100));
    output.push('');
    
    filesByType.lib.sort((a, b) => a.rel.localeCompare(b.rel)).forEach(file => {
      const content = collected.get(file.path);
      const lines = content.split('\n').length;
      
      output.push(`📄 ${file.rel}`);
      output.push(`📊 ${lines} satır`);
      output.push('─'.repeat(60));
      output.push('');
      output.push(content);
      output.push('');
    });
  }
  
  // ÖZET
  const totalLines = Array.from(collected.values())
    .reduce((sum, content) => sum + content.split('\n').length, 0);
  
  output.push('='.repeat(100));
  output.push('📊 ÖZET');
  output.push('='.repeat(100));
  output.push(`Toplam Dosya: ${collected.size}`);
  output.push(`App Sayfaları: ${filesByType.appPages.length}`);
  output.push(`App Layout'ları: ${filesByType.appLayouts.length}`);
  output.push(`Diğer App: ${filesByType.appOthers.length}`);
  output.push(`Component'ler: ${filesByType.components.length}`);
  output.push(`Utility'ler: ${filesByType.lib.length}`);
  output.push(`Diğer: ${filesByType.others.length}`);
  output.push(`Toplam Satır: ${totalLines}`);
  output.push('');
  
  output.push('📋 BULUNAN SAYFA ROUTE\'LARI:');
  Array.from(foundPages).sort().forEach(page => {
    output.push(`  • ${page}`);
  });
  
  output.push('='.repeat(100));
  
  // Dosyaya yaz
  fs.writeFileSync(outputFile, output.join('\n'), 'utf-8');
  
  return outputFile;
}

// Ana fonksiyon
async function main() {
  console.log(`🎯 Hedef: ${TARGET_PAGE}`);
  console.log('─'.repeat(50));
  
  try {
    const startPath = path.join(PROJECT_ROOT, TARGET_PAGE);
    
    if (!fs.existsSync(startPath)) {
      console.error(`❌ Dosya bulunamadı: ${startPath}`);
      return;
    }
    
    // 1. Başlangıç dosyasını topla
    console.log('🔍 Başlangıç dosyası ve bağımlılıkları toplanıyor...\n');
    collectFile(startPath);
    
    // 2. Tüm admin dizinini tarayarak page dosyalarını bul
    console.log('\n🔎 Admin dizinindeki TÜM sayfalar aranıyor...');
    const adminDir = path.dirname(startPath);
    const allPages = findAllPageFiles(adminDir);
    
    console.log(`📁 ${allPages.length} sayfa dosyası bulundu`);
    
    // 3. Bulunan her sayfayı topla
    allPages.forEach(pageFile => {
      if (!visited.has(normalizePath(pageFile))) {
        console.log(`📄 ${normalizePath(path.relative(PROJECT_ROOT, pageFile))}`);
        collectFile(pageFile);
      }
    });
    
    // 4. Aynı dizindeki diğer admin sayfalarını da ara
    const adminRoot = path.join(PROJECT_ROOT, 'app/admin');
    if (fs.existsSync(adminRoot)) {
      console.log('\n🔎 Admin root dizinindeki alt sayfalar aranıyor...');
      const subDirs = fs.readdirSync(adminRoot, { withFileTypes: true })
        .filter(item => item.isDirectory())
        .map(dir => dir.name);
      
      subDirs.forEach(subDir => {
        const subDirPath = path.join(adminRoot, subDir);
        const subPages = findAllPageFiles(subDirPath);
        
        subPages.forEach(pageFile => {
          if (!visited.has(normalizePath(pageFile))) {
            console.log(`📄 ${normalizePath(path.relative(PROJECT_ROOT, pageFile))}`);
            collectFile(pageFile);
          }
        });
      });
    }
    
    // 5. Çıktı oluştur
    const outputFile = createOutput();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ TAMAMLANDI!');
    console.log(`📁 ${collected.size} dosya toplandı`);
    console.log(`🌐 ${foundPages.size} sayfa bulundu`);
    console.log(`📄 ${outputFile} oluşturuldu`);
    console.log('='.repeat(50));
    
    // Bulunan sayfaları göster
    if (foundPages.size > 0) {
      console.log('\n📋 BULUNAN SAYFALAR:');
      Array.from(foundPages).sort().forEach((page, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${page}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

main();