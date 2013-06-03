Based on (metacircular Scheme) evaluator in Structure and
Interpretation of Computer Programs (SICP) -
http://mitpress.mit.edu/sicp/full-text/book/book-Z-H-26.html#%_sec_4.1.1

The model has two basic parts:

1. To evaluate a combination (a compound expression other than a special form), evaluate the subexpressions and then apply the value of the operator subexpression to the values of the operand subexpressions.

2. To apply a compound procedure to a set of arguments, evaluate the body of the procedure in a new environment. To construct this environment, extend the environment part of the procedure object by a frame in which the formal parameters of the procedure are bound to the arguments to which the procedure is applied.

