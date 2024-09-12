import Lake
open Lake DSL

package leanProject where
  -- add package configuration options here
  leanOptions := #[
    ⟨`pp.unicode.fun, true⟩ ]

@[default_target]
lean_lib LeanProject where
  -- add library configuration options here
  leanOptions := #[
    ⟨`pp.unicode.fun, true⟩ ]
