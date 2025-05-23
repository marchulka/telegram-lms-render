const fs = require('fs');
const pdfParse = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');

// 1. Заполни свои параметры Supabase:
const SUPABASE_URL = 'https://<ТВОЙ_УРЛ>.supabase.co';
const SUPABASE_KEY = '<ТВОЙ_АНОН_КЛЮЧ>';

// 2. Укажи путь к своему PDF-файлу:
const PDF_PATH = './yourfile.pdf';  // заменишь на нужный путь и имя

// Настрой клиент Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function saveDocument(file_name, uploaded_by = 'admin') {
  // Сохраним инфу о PDF один раз
  const { data, error } = await supabase
    .from('pdf_documents')
    .insert([{ file_name, uploaded_by }])
    .select();
  if (error) throw error;
  return data[0].id;
}

async function saveChunk(document_id, chunk_index, chunk_text, meta = {}) {
  const { error } = await supabase
    .from('pdf_chunks')
    .insert([{ document_id, chunk_index, chunk_text, meta }]);
  if (error) throw error;
}

async function main() {
  // 3. Читаем файл
  const fileBuffer = fs.readFileSync(PDF_PATH);
  const pdfData = await pdfParse(fileBuffer);
  const text = pdfData.text;

  // 4. Разделим на чанки (по 1000 символов с overlap 200)
  const chunkSize = 1000;
  const overlap = 200;
  let chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    start += chunkSize - overlap;
  }

  // 5. Cохраним документ
  const docId = await saveDocument(PDF_PATH.split('/').pop());

  // 6. Сохраним чанки
  for (let i = 0; i < chunks.length; i++) {
    await saveChunk(docId, i, chunks[i]);
    console.log(`Сохранён чанк ${i+1} из ${chunks.length}`);
  }

  console.log('Готово! Все чанки записаны в Supabase.');
}

// Стартуем обработку
main().catch(console.error);