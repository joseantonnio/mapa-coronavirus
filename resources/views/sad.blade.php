@include('layouts.header')

<main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
    <div class="text-center pt-3 pb-2 mb-3">
        <h1 class="h2">Que pena :(</h1>
        <img src="https://media.giphy.com/media/JreLOq5hxba4wYV0Jj/giphy.gif" class="my-5" />
        <p>Você iria deixar um desenvolvedor muito feliz com aquele cafézinho...</p>
        <a href="{{ route('home') }}" class="btn btn-primary">Voltar ao mapa</a>
    </div>
</main>

@include('layouts.footer')