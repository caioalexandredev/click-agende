"use client";

import { AlertCircle, ImageIcon, LinkIcon, Loader2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ImageUploadInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => Promise<void>;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

function validateFile(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Use uma imagem JPG, PNG ou WebP.";
  }

  if (file.size > MAX_SIZE) {
    return "A imagem deve ter no máximo 5MB.";
  }

  return undefined;
}

export function ImageUploadInput({
  id,
  label,
  value,
  onChange,
  onUpload,
  onRemove,
  error,
  hint,
  wrapperClassName,
}: ImageUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [localError, setLocalError] = useState("");
  const feedback = localError || error;

  async function handleFile(file?: File) {
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError("");
    setUploading(true);

    try {
      const uploadedUrl = await onUpload(file);
      onChange(uploadedUrl);
    } catch (uploadError) {
      setLocalError(
        uploadError instanceof Error ? uploadError.message : "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setLocalError("");

    if (!onRemove) {
      onChange("");
      return;
    }

    setRemoving(true);

    try {
      await onRemove();
    } catch (removeError) {
      setLocalError(
        removeError instanceof Error ? removeError.message : "Não foi possível remover a imagem.",
      );
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className={cn("space-y-2", wrapperClassName)}>
      <Label htmlFor={id}>{label}</Label>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFile(event.dataTransfer.files.item(0) ?? undefined);
        }}
        className={cn(
          "overflow-hidden rounded-xl border border-dashed border-input bg-background/60 transition",
          dragging && "border-primary bg-primary/5",
          feedback && "border-destructive/60",
        )}
      >
        {value ? (
          <div className="flex items-center gap-3 p-3">
            <div
              role="img"
              aria-label="Prévia da foto de capa"
              className="h-20 w-32 shrink-0 rounded-lg bg-muted bg-cover bg-center"
              style={{ backgroundImage: `url(${value})` }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Foto de capa selecionada</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{value}</p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid min-h-28 w-full place-items-center px-4 py-4 text-center"
          >
            <span className="flex items-center gap-3 text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <UploadCloud className="h-5 w-5" />
                )}
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  Arraste uma imagem ou clique para selecionar
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  JPG, PNG ou WebP até 5MB
                </span>
              </span>
            </span>
          </button>
        )}

        <div className="grid gap-2 border-t border-border/70 p-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={id}
              value={value}
              onChange={(event) => {
                setLocalError("");
                onChange(event.target.value);
              }}
              placeholder="https://exemplo.com/capa.jpg"
              className="h-9 pl-9"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || removing}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            {value ? "Trocar" : "Enviar"}
          </Button>

          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={uploading || removing}>
              {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Remover
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(event) => void handleFile(event.target.files?.item(0) ?? undefined)}
      />

      {feedback ? (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {feedback}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
