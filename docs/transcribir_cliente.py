import sys, json, wave, os
os.environ['VOSK_LOG_LEVEL'] = '-1'
from vosk import Model, KaldiRecognizer

model = Model(r'C:\\Users\\HP\\Documents\\Mandragora\\vosk-model-es-0.42')
docs = r'C:\\Users\\HP\\Documents\\Mandragora\\deploy\\docs'

audio_files = [
    ("cliente-reinion1.mp3", "cliente-reinion1"),
    ("cliente-reinion2.ogg", "cliente-reinion2"),
    ("cliente-reinion3.ogg", "cliente-reinion3"),
    ("cliente-reinion4.ogg", "cliente-reinion4"),
    ("cliente-reinion5.ogg", "cliente-reinion5"),
]

for audio_file, base_name in audio_files:
    print(f"Procesando {audio_file}...")
    input_path = os.path.join(docs, audio_file)
    wav_file = os.path.join(docs, base_name + "_temp.wav")
    output_path = os.path.join(docs, base_name + ".txt")
    
    # Convert to WAV
    cmd = f'ffmpeg -y -i "{input_path}" -ar 16000 -ac 1 "{wav_file}"'
    os.system(cmd + ' 2>nul')
    
    if not os.path.exists(wav_file):
        print(f"  ERROR: no se pudo convertir")
        continue
    
    wf = wave.open(wav_file, 'rb')
    rec = KaldiRecognizer(model, wf.getframerate())
    texto = ''
    
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            res = json.loads(rec.Result())
            texto += res.get('text', '') + ' '
    
    res = json.loads(rec.FinalResult())
    texto += res.get('text', '')
    wf.close()
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(texto.strip())
    
    print(f"  OK: {len(texto)} caracteres")
    os.remove(wav_file)

print("Listo.")
