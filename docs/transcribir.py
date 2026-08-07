import sys, json, wave, os
os.environ['VOSK_LOG_LEVEL'] = '-1'
from vosk import Model, KaldiRecognizer

MODEL_DIR = r'C:\Users\HP\Documents\Mandragora\vosk-model-es-0.42'
DOCS_DIR = r'C:\Users\HP\Documents\Mandragora\deploy\docs'

model = Model(MODEL_DIR)

def transcribe(input_file, output_file):
    wav_file = input_file.replace('.ogg', '_temp.wav').replace('.mp3', '_temp.wav')
    cmd = f'ffmpeg -y -i "{input_file}" -ar 16000 -ac 1 "{wav_file}"'
    os.system(cmd + ' 2>nul')
    
    if not os.path.exists(wav_file):
        return False
    
    wf = wave.open(wav_file, 'rb')
    rec = KaldiRecognizer(model, wf.getframerate())
    texto = ''
    
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            texto += json.loads(rec.Result()).get('text', '') + ' '
    
    texto += json.loads(rec.FinalResult()).get('text', '')
    wf.close()
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(texto.strip())
    
    os.remove(wav_file)
    return len(texto)

files = [
    'cliente-reinion1.mp3',
    'cliente-reinion2.ogg',
    'cliente-reinion3.ogg',
    'cliente-reinion4.ogg',
    'cliente-reinion5.ogg',
]

for f in files:
    inp = os.path.join(DOCS_DIR, f)
    out = os.path.join(DOCS_DIR, f.replace('.ogg','.txt').replace('.mp3','.txt'))
    print(f'Transcribiendo {f}...')
    n = transcribe(inp, out)
    print(f'  {"OK: "+str(n)+" chars" if n else "ERROR"}')

print('Listo.')
