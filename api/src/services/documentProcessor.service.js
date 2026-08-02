import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

export const documentProcessor = {
  /**
   * Parse raw file buffer into clean text and metadata
   */
  async parseBuffer({ buffer, fileType }) {
    if (!buffer) throw new Error('No file buffer provided for document processing.');

    let text = '';
    let pageCount = 1;

    if (fileType === 'pdf') {
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      text = data.text || '';
      pageCount = data.pages?.length || 1;
    } else if (fileType === 'docx') {
      const docxData = await mammoth.extractRawText({ buffer });
      text = docxData.value || '';
    } else if (fileType === 'md' || fileType === 'txt') {
      text = buffer.toString('utf-8');
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    return {
      rawText: text,
      pageCount,
    };
  },

  /**
   * Scrape and clean text content from a web URL using Cheerio
   */
  async scrapeUrl(url) {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'NexBlog-AI-Knowledge-Bot/3.2 (+https://nexblog.ai)' },
    });
    if (!response.ok) throw new Error(`Failed to fetch URL (${response.status}): ${url}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove noise elements
    $('script, style, nav, footer, header, aside, svg, iframe, noscript').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim() || url;
    const author = $('meta[name="author"]').attr('content') || $('meta[property="article:author"]').attr('content') || 'Web Creator';
    const mainText = $('main, article, .content, .post, body').text();

    return {
      rawText: mainText,
      title,
      author,
    };
  },

  /**
   * Clean and normalize raw text
   */
  cleanAndNormalize(rawText = '') {
    return rawText
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      // eslint-disable-next-line no-control-regex -- intentional: strip control bytes left over from PDF/DOCX extraction
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
      .replace(/\n{3,}/g, '\n\n') // Collapse excessive breaks
      .replace(/ {2,}/g, ' ') // Collapse multiple spaces
      .trim();
  },

  /**
   * Sliding window text chunking
   */
  chunkText(normalizedText, maxWordsPerChunk = 250, overlapWords = 35) {
    const words = normalizedText.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];

    const chunks = [];
    let start = 0;
    let index = 0;

    while (start < words.length) {
      const end = Math.min(start + maxWordsPerChunk, words.length);
      const chunkWords = words.slice(start, end);
      const chunkString = chunkWords.join(' ');

      chunks.push({
        chunkIndex: index++,
        text: chunkString,
        wordCount: chunkWords.length,
      });

      if (end === words.length) break;
      start = end - overlapWords;
    }

    return chunks;
  },

  /**
   * Extract rich metadata (heading, section, keywords, checksum) for a chunk
   */
  extractChunkMetadata({ chunkText, chunkIndex, documentTitle = '', author = '', source = '', page = 1 }) {
    // Checksum
    const checksum = crypto.createHash('sha256').update(chunkText).digest('hex');

    // Extract potential heading (Markdown # or first bold/capital sentence)
    const mdMatch = chunkText.match(/^(#{1,3})\s+(.+)/m);
    let heading = `Section ${chunkIndex + 1}`;
    if (mdMatch) {
      heading = mdMatch[2].trim();
    } else {
      const firstSentence = chunkText.split(/[.!?\n]/)[0]?.trim();
      if (firstSentence && firstSentence.length < 80) {
        heading = firstSentence;
      }
    }

    // Keyword extraction (words > 4 letters sorted by frequency)
    const words = chunkText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 4);
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const keywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(entry => entry[0]);

    return {
      title: documentTitle,
      author: author || 'Unknown Creator',
      page: page || 1,
      heading,
      section: `Chunk ${chunkIndex + 1}`,
      keywords,
      language: 'en',
      importance: 'high',
      source: source || documentTitle,
      checksum,
    };
  },
};
