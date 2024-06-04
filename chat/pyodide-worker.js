const indexURL = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
importScripts(`${indexURL}pyodide.js`);

(async () => {
    self.pyodide = await loadPyodide({ indexURL })
    await self.pyodide.loadPackage("micropip");
    const micropip = self.pyodide.pyimport("micropip");
    await micropip.install(['numpy', 'imjoy-rpc', 'pyodide-http']);
    // NOTE: We intentionally avoid runPythonAsync here because we don't want this to pre-load extra modules like matplotlib.
    self.pyodide.runPython(setupCode)
    self.postMessage({loading: true})  // Inform the main thread that we finished loading.
})()

let outputs = []

function write(type, content) {
    self.postMessage({ type, content })
    outputs.push({ type, content })
    return content.length
}

function logService(type, url, attrs) {
    outputs.push({type, content: url, attrs: attrs?.toJs({dict_converter : Object.fromEntries})})
    self.postMessage({ type, content: url, attrs: attrs?.toJs({dict_converter : Object.fromEntries}) })
}

function show(type, url, attrs) {
    const turl = url.length > 32 ? url.slice(0, 32) + "..." : url
    outputs.push({type, content: turl, attrs: attrs?.toJs({dict_converter : Object.fromEntries})})
    self.postMessage({ type, content: url, attrs: attrs?.toJs({dict_converter : Object.fromEntries}) })
}

function store_put(key, value) {
    self.postMessage({ type: "store", key, content: `${value}` })
}

// Stand-in for `time.sleep`, which does not actually sleep.
// To avoid a busy loop, instead import asyncio and await asyncio.sleep().
function spin(seconds) {
    const time = performance.now() + seconds * 1000
    while (performance.now() < time);
}

// NOTE: eval(compile(source, "<string>", "exec", ast.PyCF_ALLOW_TOP_LEVEL_AWAIT))
// returns a coroutine if `source` contains a top-level await, and None otherwise.

const setupCode = `
import array
import ast
import base64
import contextlib
import io
import js
import pyodide
import sys
import time
import traceback
import wave
import pyodide_http

python_version = f"{sys.version_info.major}.{sys.version_info.minor}"; print(python_version)

pyodide_http.patch_all()  # Patch all libraries
help_string = f"""
Welcome to BioImage.IO Chatbot Debug console!
Python {python_version} on Pyodide {pyodide.__version__}

In this console, you can run Python code and interact with the code interpreter used by the chatbot.
You can inspect variables, run functions, and more.

If this is your first time using Python, you should definitely check out
the tutorial on the internet at https://docs.python.org/{python_version}/tutorial/.
Enter the name of any module, keyword, or topic to get help on writing
Python programs and using Python modules.  To quit this help utility and
return to the interpreter, just type "quit".
To get a list of available modules, keywords, symbols, or topics, type
"modules", "keywords", "symbols", or "topics".  Each module also comes
with a one-line summary of what it does; to list the modules whose name
or summary contain a given string such as "spam", type "modules spam".
"""

__builtins__.help = lambda *args, **kwargs: print(help_string)

# patch hypha services
import imjoy_rpc.hypha
_connect_to_server = imjoy_rpc.hypha.connect_to_server

async def patched_connect_to_server(*args, **kwargs):
    server = await _connect_to_server(*args, **kwargs)
    _register_service = server.register_service
    async def patched_register_service(*args, **kwargs):
        svc_info = await _register_service(*args, **kwargs)
        service_id = svc_info['id'].split(':')[1]
        service_url = f"{server.config['public_base_url']}/{server.config['workspace']}/services/{service_id}"
        js.logService("service", service_url, svc_info)
        return svc_info
    server.register_service = patched_register_service
    server.registerService = patched_register_service
    return server

imjoy_rpc.hypha.connect_to_server = patched_connect_to_server

# For redirecting stdout and stderr later.
class JSOutWriter(io.TextIOBase):
    def write(self, s):
        return js.write("stdout", s)

class JSErrWriter(io.TextIOBase):
    def write(self, s):
        return js.write("stderr", s)

def setup_matplotlib():
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt

    def show():
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        img = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode('utf-8')
        js.show("img", img)
        plt.clf()

    plt.show = show

def show_image(image, **attrs):
    from PIL import Image
    if not isinstance(image, Image.Image):
        image = Image.fromarray(image)
    buf = io.BytesIO()
    image.save(buf, format='png')
    data = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode('utf-8')
    js.show("img", data, attrs)

_store = {}
def store_put(key, value):
    _store[key] = value
    js.store_put(key, value)

def store_get(key):
    return _store.get(key)

def show_animation(frames, duration=100, format="apng", loop=0, **attrs):
    from PIL import Image
    buf = io.BytesIO()
    img, *imgs = [frame if isinstance(frame, Image.Image) else Image.fromarray(frame) for frame in frames]
    img.save(buf, format='png' if format == "apng" else format, save_all=True, append_images=imgs, duration=duration, loop=0)
    img = f'data:image/{format};base64,' + base64.b64encode(buf.getvalue()).decode('utf-8')
    js.show("img", img, attrs)

def convert_audio(data):
    try:
        import numpy as np
        is_numpy = isinstance(data, np.ndarray)
    except ImportError:
        is_numpy = False
    if is_numpy:
        if len(data.shape) == 1:
            channels = 1
        if len(data.shape) == 2:
            channels = data.shape[0]
            data = data.T.ravel()
        else:
            raise ValueError("Too many dimensions (expected 1 or 2).")
        return ((data * (2**15 - 1)).astype("<h").tobytes(), channels)
    else:
        data = array.array('h', (int(x * (2**15 - 1)) for x in data))
        if sys.byteorder == 'big':
            data.byteswap()
        return (data.tobytes(), 1)

def show_audio(samples, rate):
    bytes, channels = convert_audio(samples)
    buf = io.BytesIO()
    with wave.open(buf, mode='wb') as w:
        w.setnchannels(channels)
        w.setframerate(rate)
        w.setsampwidth(2)
        w.setcomptype('NONE', 'NONE')
        w.writeframes(bytes)
    audio = 'data:audio/wav;base64,' + base64.b64encode(buf.getvalue()).decode('utf-8')
    js.show("audio", audio)

# HACK: Prevent 'wave' import from failing because audioop is not included with pyodide.
import types
import ast
embed = types.ModuleType('embed')
sys.modules['embed'] = embed
embed.image = show_image
embed.animation = show_animation
embed.audio = show_audio

def preprocess_code(source):
    """Parse the source code and separate it into main code and last expression."""
    parsed_ast = ast.parse(source)
    
    last_node = parsed_ast.body[-1] if parsed_ast.body else None
    
    if isinstance(last_node, ast.Expr):
        # Separate the AST into main body and last expression
        main_body_ast = ast.Module(body=parsed_ast.body[:-1], type_ignores=parsed_ast.type_ignores)
        last_expr_ast = last_node
        
        # Convert main body AST back to source code for exec
        main_body_code = ast.unparse(main_body_ast)
        
        return main_body_code, last_expr_ast
    else:
        # If the last node is not an expression, treat the entire code as the main body
        return source, None
    

context = {"store_put": store_put, "store_get": store_get}

async def run(source, io_context):
    out = JSOutWriter()
    err = JSErrWriter()
    io_context = io_context or {}
    inputs = io_context.get("inputs") or []
    outputs = io_context.get("outputs") or []
    for ip in inputs:
        if ip not in _store:
            raise Exception("Error: Input not found in store:", ip)
        context[ip] = store_get(ip)
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        try:
            imports = pyodide.code.find_imports(source)
            await js.pyodide.loadPackagesFromImports(source)
            if "matplotlib" in imports or "skimage" in imports:
                setup_matplotlib()
            if "embed" in imports:
                await js.pyodide.loadPackagesFromImports("import numpy, PIL")
            
            source, last_expression = preprocess_code(source)
            code = compile(source, "<string>", "exec", ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)

            result = eval(code, context)
            if result is not None:
                result = await result
            if last_expression:
                if isinstance(last_expression.value, ast.Await):
                    # If last expression is an await, compile and execute it as async
                    last_expr_code = compile(ast.Expression(last_expression.value), "<string>", "eval", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
                    result = await eval(last_expr_code, context)
                else:
                    # If last expression is not an await, compile and evaluate it normally
                    last_expr_code = compile(ast.Expression(last_expression.value), "<string>", "eval")
                    result = eval(last_expr_code, context)
                if result is not None:
                    print(result)
            for op in outputs:
                if op not in context:
                    raise Exception("Error: The script did not produce an variable named: " +  op)
                store_put(op, context[op])
        except:
            traceback.print_exc()
            raise
`
const mountedFs = {}

self.onmessage = async (event) => {
    if(event.data.source){
        try{
            const { source, io_context } = event.data
            self.pyodide.globals.set("source", source)
            self.pyodide.globals.set("io_context", io_context && self.pyodide.toPy(io_context))
            outputs = []
            // see https://github.com/pyodide/pyodide/blob/b177dba277350751f1890279f5d1a9096a87ed13/src/js/api.ts#L546
            // sync native ==> browser
            await new Promise((resolve, _) => self.pyodide.FS.syncfs(true, resolve));
            await self.pyodide.runPythonAsync("await run(source, io_context)")
            // sync browser ==> native
            await new Promise((resolve, _) => self.pyodide.FS.syncfs(false, resolve)),
            console.log("Execution done", outputs)
            self.postMessage({ executionDone: true, outputs })
            outputs = []
        }
        catch(e){
            console.error("Execution Error", e)
            self.postMessage({ executionError: e.message })
        }
    }
    if(event.data.mount){
        try{
            const { mountPoint, dirHandle } = event.data.mount
            if(mountedFs[mountPoint]){
                console.log("Unmounting native FS:", mountPoint)
                await self.pyodide.FS.unmount(mountPoint)
                delete mountedFs[mountPoint]
            }
            const nativefs = await self.pyodide.mountNativeFS(mountPoint, dirHandle)
            mountedFs[mountPoint] = nativefs
            console.log("Native FS mounted:", mountPoint, nativefs)
            self.postMessage({ mounted: mountPoint })
        }
        catch(e){
            self.postMessage({ mountError: e.message })
        }
    }

}
