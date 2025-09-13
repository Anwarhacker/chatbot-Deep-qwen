"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ModelSelectorProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

const models = [
  { id: "deepseek/deepseek-r1-0528-qwen3-8b:free", name: "DeepSeek R1 (Free)", description: "Fast and efficient" },
  { id: "meta-llama/llama-3.2-3b-instruct:free", name: "Llama 3.2 3B (Free)", description: "Balanced performance" },
  { id: "microsoft/phi-3-mini-128k-instruct:free", name: "Phi-3 Mini (Free)", description: "Compact and quick" },
  { id: "google/gemma-2-9b-it:free", name: "Gemma 2 9B (Free)", description: "Google's latest" },
]

export function ModelSelector({ value, onValueChange, disabled }: ModelSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select AI Model" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex flex-col">
              <span className="font-medium">{model.name}</span>
              <span className="text-xs text-muted-foreground">{model.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
