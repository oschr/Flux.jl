var documenterSearchIndex = {"docs": [

{
    "location": "index.html#",
    "page": "Home",
    "title": "Home",
    "category": "page",
    "text": ""
},

{
    "location": "index.html#Flux:-The-Julia-Machine-Learning-Library-1",
    "page": "Home",
    "title": "Flux: The Julia Machine Learning Library",
    "category": "section",
    "text": "Flux is a library for machine learning. It comes \"batteries-included\" with many useful tools built in, but also lets you use the full power of the Julia language where you need it. The whole stack is implemented in clean Julia code (right down to the GPU kernels) and any part can be tweaked to your liking."
},

{
    "location": "index.html#Installation-1",
    "page": "Home",
    "title": "Installation",
    "category": "section",
    "text": "Install Julia 0.6.0 or later, if you haven't already.Pkg.add(\"Flux\")\nPkg.test(\"Flux\") # Check things installed correctlyStart with the basics. The model zoo is also a good starting point for many common kinds of models."
},

{
    "location": "models/basics.html#",
    "page": "Basics",
    "title": "Basics",
    "category": "page",
    "text": ""
},

{
    "location": "models/basics.html#Model-Building-Basics-1",
    "page": "Basics",
    "title": "Model-Building Basics",
    "category": "section",
    "text": ""
},

{
    "location": "models/basics.html#Taking-Gradients-1",
    "page": "Basics",
    "title": "Taking Gradients",
    "category": "section",
    "text": "Consider a simple linear regression, which tries to predict an output array y from an input x. (It's a good idea to follow this example in the Julia repl.)W = rand(2, 5)\nb = rand(2)\n\npredict(x) = W*x .+ b\nloss(x, y) = sum((predict(x) .- y).^2)\n\nx, y = rand(5), rand(2) # Dummy data\nloss(x, y) # ~ 3To improve the prediction we can take the gradients of W and b with respect to the loss function and perform gradient descent. We could calculate gradients by hand, but Flux will do it for us if we tell it that W and b are trainable parameters.using Flux.Tracker: param, back!, data, grad\n\nW = param(W)\nb = param(b)\n\nl = loss(x, y)\n\nback!(l)loss(x, y) returns the same number, but it's now a tracked value that records gradients as it goes along. Calling back! then calculates the gradient of W and b. We can see what this gradient is, and modify W to train the model.grad(W)\n\nW.data .-= 0.1grad(W)\n\nloss(x, y) # ~ 2.5The loss has decreased a little, meaning that our prediction x is closer to the target y. If we have some data we can already try training the model.All deep learning in Flux, however complex, is a simple generalisation of this example. Of course, models can look very different – they might have millions of parameters or complex control flow, and there are ways to manage this complexity. Let's see what that looks like."
},

{
    "location": "models/basics.html#Building-Layers-1",
    "page": "Basics",
    "title": "Building Layers",
    "category": "section",
    "text": "It's common to create more complex models than the linear regression above. For example, we might want to have two linear layers with a nonlinearity like sigmoid (σ) in between them. In the above style we could write this as:W1 = param(rand(3, 5))\nb1 = param(rand(3))\nlayer1(x) = W1 * x .+ b1\n\nW2 = param(rand(2, 3))\nb2 = param(rand(2))\nlayer2(x) = W2 * x .+ b2\n\nmodel(x) = layer2(σ.(layer1(x)))\n\nmodel(rand(5)) # => 2-element vectorThis works but is fairly unwieldy, with a lot of repetition – especially as we add more layers. One way to factor this out is to create a function that returns linear layers.function linear(in, out)\n  W = param(randn(out, in))\n  b = param(randn(out))\n  x -> W * x .+ b\nend\n\nlinear1 = linear(5, 3) # we can access linear1.W etc\nlinear2 = linear(3, 2)\n\nmodel(x) = linear2(σ.(linear1(x)))\n\nmodel(x) # => 2-element vectorAnother (equivalent) way is to create a struct that explicitly represents the affine layer.struct Affine\n  W\n  b\nend\n\nAffine(in::Integer, out::Integer) =\n  Affine(param(randn(out, in)), param(randn(out)))\n\n# Overload call, so the object can be used as a function\n(m::Affine)(x) = m.W * x .+ m.b\n\na = Affine(10, 5)\n\na(rand(10)) # => 5-element vectorCongratulations! You just built the Dense layer that comes with Flux. Flux has many interesting layers available, but they're all things you could have built yourself very easily.(There is one small difference with Dense – for convenience it also takes an activation function, like Dense(10, 5, σ).)"
},

{
    "location": "models/basics.html#Stacking-It-Up-1",
    "page": "Basics",
    "title": "Stacking It Up",
    "category": "section",
    "text": "It's pretty common to write models that look something like:layer1 = Dense(10, 5, σ)\n# ...\nmodel(x) = layer3(layer2(layer1(x)))For long chains, it might be a bit more intuitive to have a list of layers, like this:using Flux\n\nlayers = [Dense(10, 5, σ), Dense(5, 2), softmax]\n\nmodel(x) = foldl((x, m) -> m(x), x, layers)\n\nmodel(rand(10)) # => 2-element vectorHandily, this is also provided for in Flux:model2 = Chain(\n  Dense(10, 5, σ),\n  Dense(5, 2),\n  softmax)\n\nmodel2(rand(10)) # => 2-element vectorThis quickly starts to look like a high-level deep learning library; yet you can see how it falls out of simple abstractions, and we lose none of the power of Julia code.A nice property of this approach is that because \"models\" are just functions (possibly with trainable parameters), you can also see this as simple function composition.m = Dense(5, 2) ∘ Dense(10, 5, σ)\n\nm(rand(10))Likewise, Chain will happily work with any Julia function.m = Chain(x -> x^2, x -> x+1)\n\nm(5) # => 26"
},

{
    "location": "models/recurrence.html#",
    "page": "Recurrence",
    "title": "Recurrence",
    "category": "page",
    "text": ""
},

{
    "location": "models/recurrence.html#Recurrent-Models-1",
    "page": "Recurrence",
    "title": "Recurrent Models",
    "category": "section",
    "text": ""
},

{
    "location": "models/recurrence.html#Recurrent-Cells-1",
    "page": "Recurrence",
    "title": "Recurrent Cells",
    "category": "section",
    "text": "In the simple feedforward case, our model m is a simple function from various inputs xᵢ to predictions yᵢ. (For example, each x might be an MNIST digit and each y a digit label.) Each prediction is completely independent of any others, and using the same x will always produce the same y.y₁ = f(x₁)\ny₂ = f(x₂)\ny₃ = f(x₃)\n# ...Recurrent networks introduce a hidden state that gets carried over each time we run the model. The model now takes the old h as an input, and produces a new h as output, each time we run it.h = # ... initial state ...\ny₁, h = f(x₁, h)\ny₂, h = f(x₂, h)\ny₃, h = f(x₃, h)\n# ...Information stored in h is preserved for the next prediction, allowing it to function as a kind of memory. This also means that the prediction made for a given x depends on all the inputs previously fed into the model.(This might be important if, for example, each x represents one word of a sentence; the model's interpretation of the word \"bank\" should change if the previous input was \"river\" rather than \"investment\".)Flux's RNN support closely follows this mathematical perspective. The most basic RNN is as close as possible to a standard Dense layer, and the output and hidden state are the same. By convention, the hidden state is the first input and output.Wxh = randn(5, 10)\nWhh = randn(5, 5)\nb   = randn(5)\n\nfunction rnn(h, x)\n  h = tanh.(Wxh * x .+ Whh * h .+ b)\n  return h, h\nend\n\nx = rand(10) # dummy data\nh = rand(5)  # initial hidden state\n\nh, y = rnn(h, x)If you run the last line a few times, you'll notice the output y changing slightly even though the input x is the same.We sometimes refer to functions like rnn above, which explicitly manage state, as recurrent cells. There are various recurrent cells available, which are documented in the layer reference. The hand-written example above can be replaced with:using Flux\n\nrnn2 = Flux.RNNCell(10, 5)\n\nx = rand(10) # dummy data\nh = rand(5)  # initial hidden state\n\nh, y = rnn2(h, x)"
},

{
    "location": "models/recurrence.html#Stateful-Models-1",
    "page": "Recurrence",
    "title": "Stateful Models",
    "category": "section",
    "text": "For the most part, we don't want to manage hidden states ourselves, but to treat our models as being stateful. Flux provides the Recur wrapper to do this.x = rand(10)\nh = rand(5)\n\nm = Flux.Recur(rnn, h)\n\ny = m(x)The Recur wrapper stores the state between runs in the m.state field.If you use the RNN(10, 5) constructor – as opposed to RNNCell – you'll see that it's simply a wrapped cell.julia> RNN(10, 5)\nRecur(RNNCell(Dense(15, 5)))"
},

{
    "location": "models/recurrence.html#Sequences-1",
    "page": "Recurrence",
    "title": "Sequences",
    "category": "section",
    "text": "Often we want to work with sequences of inputs, rather than individual xs.seq = [rand(10) for i = 1:10]With Recur, applying our model to each element of a sequence is trivial:m.(seq) # returns a list of 5-element vectorsThis works even when we've chain recurrent layers into a larger model.m = Chain(LSTM(10, 15), Dense(15, 5))\nm.(seq)"
},

{
    "location": "models/recurrence.html#Truncating-Gradients-1",
    "page": "Recurrence",
    "title": "Truncating Gradients",
    "category": "section",
    "text": "By default, calculating the gradients in a recurrent layer involves the entire history. For example, if we call the model on 100 inputs, calling back! will calculate the gradient for those 100 calls. If we then calculate another 10 inputs we have to calculate 110 gradients – this accumulates and quickly becomes expensive.To avoid this we can truncate the gradient calculation, forgetting the history.truncate!(m)Calling truncate! wipes the slate clean, so we can call the model with more inputs without building up an expensive gradient computation."
},

{
    "location": "models/layers.html#",
    "page": "Layer Reference",
    "title": "Layer Reference",
    "category": "page",
    "text": ""
},

{
    "location": "models/layers.html#Flux.Chain",
    "page": "Layer Reference",
    "title": "Flux.Chain",
    "category": "Type",
    "text": "Chain(layers...)\n\nChain multiple layers / functions together, so that they are called in sequence on a given input.\n\nm = Chain(x -> x^2, x -> x+1)\nm(5) == 26\n\nm = Chain(Dense(10, 5), Dense(5, 2))\nx = rand(10)\nm(x) == m[2](m[1](x))\n\nChain also supports indexing and slicing, e.g. m[2] or m[1:end-1]. m[1:3](x) will calculate the output of the first three layers.\n\n\n\n"
},

{
    "location": "models/layers.html#Flux.Dense",
    "page": "Layer Reference",
    "title": "Flux.Dense",
    "category": "Type",
    "text": "Dense(in::Integer, out::Integer, σ = identity)\n\nCreates a traditional Dense layer with parameters W and b.\n\ny = σ.(W * x .+ b)\n\nThe input x must be a vector of length in, or a batch of vectors represented as an in × N matrix. The out y will be a vector or batch of length in.\n\n\n\n"
},

{
    "location": "models/layers.html#Model-Layers-1",
    "page": "Layer Reference",
    "title": "Model Layers",
    "category": "section",
    "text": "Chain\nDense"
},

{
    "location": "training/optimisers.html#",
    "page": "Optimisers",
    "title": "Optimisers",
    "category": "page",
    "text": ""
},

{
    "location": "training/optimisers.html#Optimisers-1",
    "page": "Optimisers",
    "title": "Optimisers",
    "category": "section",
    "text": "Consider a simple linear regression. We create some dummy data, calculate a loss, and backpropagate to calculate gradients for the parameters W and b.W = param(rand(2, 5))\nb = param(rand(2))\n\npredict(x) = W*x .+ b\nloss(x, y) = sum((predict(x) .- y).^2)\n\nx, y = rand(5), rand(2) # Dummy data\nl = loss(x, y) # ~ 3\nback!(l)We want to update each parameter, using the gradient, in order to improve (reduce) the loss. Here's one way to do that:using Flux.Tracker: data, grad\n\nfunction update()\n  η = 0.1 # Learning Rate\n  for p in (W, b)\n    x, Δ = data(p), grad(p)\n    x .-= η .* Δ # Apply the update\n    Δ .= 0       # Clear the gradient\n  end\nendIf we call update, the parameters W and b will change and our loss should go down.There are two pieces here: one is that we need a list of trainable parameters for the model ([W, b] in this case), and the other is the update step. In this case the update is simply gradient descent (x .-= η .* Δ), but we might choose to do something more advanced, like adding momentum.In this case, getting the variables is trivial, but you can imagine it'd be more of a pain with some complex stack of layers.m = Chain(\n  Dense(10, 5, σ),\n  Dense(5, 2), softmax)Instead of having to write [m[1].W, m[1].b, ...], Flux provides a params function params(m) that returns a list of all parameters in the model for you.For the update step, there's nothing whatsoever wrong with writing the loop above – it'll work just fine – but Flux provides various optimisers that make it more convenient.opt = SGD([W, b], 0.1) # Gradient descent with learning rate 0.1\n\nopt()An optimiser takes a parameter list and returns a function that does the same thing as update above. We can pass either opt or update to our training loop, which will then run the optimiser after every mini-batch of data."
},

{
    "location": "training/training.html#",
    "page": "Training",
    "title": "Training",
    "category": "page",
    "text": ""
},

{
    "location": "training/training.html#Training-1",
    "page": "Training",
    "title": "Training",
    "category": "section",
    "text": "To actually train a model we need three things:A loss function, that evaluates how well a model is doing given some input data.\nA collection of data points that will be provided to the loss function.\nAn optimiser that will update the model parameters appropriately.With these we can call Flux.train!:Flux.train!(loss, data, opt)There are plenty of examples in the model zoo."
},

{
    "location": "training/training.html#Loss-Functions-1",
    "page": "Training",
    "title": "Loss Functions",
    "category": "section",
    "text": "The loss that we defined in basics is completely valid for training. We can also define a loss in terms of some model:m = Chain(\n  Dense(784, 32, σ),\n  Dense(32, 10), softmax)\n\nloss(x, y) = Flux.mse(m(x), y)The loss will almost always be defined in terms of some cost function that measures the distance of the prediction m(x) from the target y. Flux has several of these built in, like mse for mean squared error or logloss for cross entropy loss, but you can calculate it however you want."
},

{
    "location": "training/training.html#Callbacks-1",
    "page": "Training",
    "title": "Callbacks",
    "category": "section",
    "text": "train! takes an additional argument, cb, that's used for callbacks so that you can observe the training process. For example:train!(loss, data, opt, cb = () -> println(\"training\"))Callbacks are called for every batch of training data. You can slow this down using Flux.throttle(f, timeout) which prevents f from being called more than once every timeout seconds.A more typical callback might look like this:test_x, test_y = # ... create single batch of test data ...\nevalcb() = @show(loss(test_x, test_y))\n\nFlux.train!(loss, data, opt,\n            cb = throttle(evalcb, 5))"
},

{
    "location": "data/onehot.html#",
    "page": "One-Hot Encoding",
    "title": "One-Hot Encoding",
    "category": "page",
    "text": ""
},

{
    "location": "data/onehot.html#One-Hot-Encoding-1",
    "page": "One-Hot Encoding",
    "title": "One-Hot Encoding",
    "category": "section",
    "text": "It's common to encode categorical variables (like true, false or cat, dog) in \"one-of-k\" or \"one-hot\" form. Flux provides the onehot function to make this easy.julia> using Flux: onehot\n\njulia> onehot(:b, [:a, :b, :c])\n3-element Flux.OneHotVector:\n false\n  true\n false\n\njulia> onehot(:c, [:a, :b, :c])\n3-element Flux.OneHotVector:\n false\n false\n  trueThe inverse is argmax (which can take a general probability distribution, as well as just booleans).julia> argmax(ans, [:a, :b, :c])\n:c\n\njulia> argmax([true, false, false], [:a, :b, :c])\n:a\n\njulia> argmax([0.3, 0.2, 0.5], [:a, :b, :c])\n:c"
},

{
    "location": "data/onehot.html#Batches-1",
    "page": "One-Hot Encoding",
    "title": "Batches",
    "category": "section",
    "text": "onehotbatch creates a batch (matrix) of one-hot vectors, and argmax treats matrices as batches.julia> using Flux: onehotbatch\n\njulia> onehotbatch([:b, :a, :b], [:a, :b, :c])\n3×3 Flux.OneHotMatrix:\n false   true  false\n  true  false   true\n false  false  false\n\njulia> onecold(ans, [:a, :b, :c])\n3-element Array{Symbol,1}:\n  :b\n  :a\n  :bNote that these operations returned OneHotVector and OneHotMatrix rather than Arrays. OneHotVectors behave like normal vectors but avoid any unnecessary cost compared to using an integer index directly. For example, multiplying a matrix with a one-hot vector simply slices out the relevant row of the matrix under the hood."
},

{
    "location": "contributing.html#",
    "page": "Contributing & Help",
    "title": "Contributing & Help",
    "category": "page",
    "text": ""
},

{
    "location": "contributing.html#Contributing-and-Help-1",
    "page": "Contributing & Help",
    "title": "Contributing & Help",
    "category": "section",
    "text": "If you need help, please ask on the Julia forum, the slack (channel #machine-learning), or Flux's Gitter.Right now, the best way to help out is to try out the examples and report any issues or missing features as you find them. The second best way is to help us spread the word, perhaps by starring the repo.If you're interested in hacking on Flux, most of the code is pretty straightforward. Adding new layer definitions or cost functions is simple using the Flux DSL itself, and things like data utilities and training processes are all plain Julia code.If you get stuck or need anything, let us know!"
},

]}