import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from "@google/genai";


@Injectable()
export class GrokService {
    private readonly ai = new GoogleGenAI({});

  constructor(
  ) {}

  public async generateReply(content: string): Promise<string> {
    if (!content) throw new Error('Content is required');

    const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: content,
        config: {
          systemInstruction: "You are Grok, an AI assistant on Twitter. Keep replies fun.",
        },
      });
      return response.text || '';
  }
}
